import expess from "express";
import { ResponseHandler } from "../utils/ResponseHandler";
import redis from "../db/client";
import { AsyncHandler } from "../utils/AsyncHanlder";
import { ApiError } from "../utils/ErrorHandler";
import server from "../server";
import { Socket, Server, Namespace } from "socket.io";
import { JoinRoom, PlayGame, Room, RoomData, RoomType } from "../types";
import { v4 as uuid } from "uuid";

export default class SocketController {
  private static instance: SocketController;
  public io: Namespace;
  public socket: Server;
  public customIdToSocketId: Map<string, string> = new Map();

  private constructor() {
    this.socket = new Server(server);
    this.io = this.socket.of("/game");
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SocketController();
    }

    return this.instance;
  }

  //   method for handling socket connection

  async connection(callback: (socket: Socket) => void) {
    this.io.on("connection", (socket: Socket) => {
      console.log("a user connected", socket.id);

      callback(socket);
    });
  }

  async disconnect(socket: Socket) {
    socket.on("disconnect", () => {
      console.log("a user disconnected");

      const userId = socket.data.userId;
      if (userId) {
        this.customIdToSocketId.delete(userId);
      }
    });
  }

  async emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  async on(socket: Socket, event: string, callback: (data: any) => void) {
    socket.on(event, callback);
  }

  async emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  async leaveRoom(socket: Socket, room: string) {
    socket.leave(room);
  }

  async getRooms() {
    return this.socket.rooms;
  }

  async getNumberOfClient(room: string): Promise<Set<string>> {
    const clients = await this.io.in(room).allSockets();
    return clients;
  }

  async increamentScore(userId: string, score: number) {
    try {
      await redis.incrBy(`user:${userId}:tic_tac_toe_high_score`, score);
    } catch (error) {
      throw new ApiError({
        status: 400,
        message: "Failed to increment score",
      });
    }
  }

  findAvailableRoom(): string[] {
    const availableRooms: string[] = [];
    const rooms = this.io.adapter.rooms;

    if (rooms) {
      rooms.forEach((sockets, room) => {
        if (sockets.size === 1) {
          availableRooms.push(room);
        }
      });
    }

    return availableRooms;
  }

  //  method for handling game logic

  async playGame() {
    this.connection((socket: Socket) => {
      // Handle Disconnection
      this.disconnect(socket);

      // Handle Joining into CustomRoom room
      this.handleJoinIntoCustomRoom(socket);

      // Handle Joining into room
      this.handleJoinIntoRoom(socket);

      // Handle Starting the game
      this.handleStartGame(socket);

      // Handle Game Over
      this.handleGameOver(socket);

      // Handle Player Left
      this.handlePlayerLeft(socket);

      // Handle Play Again
      this.handlePlayAgain(socket);

      // Handle Play Game
      this.handlePlayGame(socket);
    });
  }

  // Separate the game logic from the socket connection logic

  private handleJoinIntoCustomRoom(socket: Socket) {
    this.on(
      socket,
      "join_into_custom_room",
      async ({ userId, roomName, password }: JoinRoom) => {
        if (!userId || !roomName || !password) {
          throw new ApiError({
            status: 400,
            message: "Invalid data",
          });
        }

        const numberOfClient = await this.getNumberOfClient(roomName);

        if (numberOfClient.size >= 2) {
          throw new ApiError({
            status: 400,
            message: "Room is full",
          });
        }

        const roomStrings: string[] = await redis.lRange(
          `rooms:${userId}`,
          0,
          -1
        );

        const room = roomStrings.map(
          (roomString) => JSON.parse(roomString) as RoomType
        );

        const findThatRoom: RoomType | undefined = room.find((r) => {
          return r.name === roomName;
        });

        if (!findThatRoom) {
          throw new ApiError({
            status: 404,
            message: "Room not found",
          });
        }

        if (findThatRoom.password !== password) {
          throw new ApiError({
            status: 400,
            message: "Password is incorrect",
          });
        }

        socket.join(roomName);
        this.handleRegister(socket);

        this.joinedEmitter(socket, roomName);
      }
    );
  }

  private handleJoinIntoRoom(socket: Socket) {
    this.on(socket, "join_into_room", async () => {
      const availableRooms = this.findAvailableRoom();

      if (availableRooms.length === 0) {
        const id = uuid();
        const roomName = `customRoom${id}`;
        socket.join(`customRoom${id}`);

        this.handleRegister(socket);
        this.joinedEmitter(socket, roomName);
        this.handleChatting(roomName, socket);
      } else {
        socket.join(availableRooms[0]);
        this.joinedEmitter(socket, availableRooms[0]);
        this.handleChatting(availableRooms[0], socket);
      }
    });
  }

  private joinedEmitter(socket: Socket, roomName: string) {
    this.emitToRoom(
      roomName,
      "joined",
      new ResponseHandler({
        statusCode: 200,
        message: "Player joined the room",
      })
    );

    this.emitNumberOfClient(socket, roomName);
  }

  private handlePlayAgain(socket: Socket) {
    this.on(socket, "playAgain", async ({ roomName }: Room) => {
      const numberOfClients = await this.getNumberOfClient(roomName);

      if (numberOfClients.size <= 1) {
        this.handlePlayerLeft(socket);
      }
    });
  }

  private handleGameOver(socket: Socket) {
    this.on(socket, "game_over", async ({ data }: RoomData) => {
      const player1 = await redis.get(`user:${data.player1}`);
      const player2 = await redis.get(`user:${data.player2}`);

      if (!player1 || !player2) {
        throw new ApiError({ status: 404, message: "User not found" });
      }

      const parsedPlayer1 = JSON.parse(player1);
      const parsedPlayer2 = JSON.parse(player2);

      if (data.winner) {
        await this.increamentScore(data.winner, 5);
      } else if (data.draw) {
        await this.increamentScore(data.player1, 1);
        await this.increamentScore(data.player2, 1);
      }

      this.emitToRoom(data.roomName, "game_over", {
        parsedPlayer1,
        parsedPlayer2,
        winner: data.winner ?? null,
        draw: data.draw ?? null,
      });
    });
  }

  private handlePlayerLeft(socket: Socket) {
    this.on(socket, "player_left", ({ roomName }: Room) => {
      this.emitToRoom(roomName, "player_left", {
        message: "player left the room",
      });

      this.leaveRoom(socket, roomName);
    });
  }

  private handleStartGame(socket: Socket) {
    this.on(socket, "start_game", ({ roomName }: Room) => {
      this.emitToRoom(roomName, "game_started", {
        message: "game has started",
      });
    });
  }

  private handlePlayGame(socket: Socket) {
    this.on(
      socket,
      "play_game",
      async ({ roomName, userId, data }: PlayGame) => {
        const getNumberOfClient = await this.getNumberOfClient(roomName);
        const getNumberOfClientArray = Array.from(getNumberOfClient);

        const player1 = this.customIdToSocketId.get(getNumberOfClientArray[0]);
        const player2 = this.customIdToSocketId.get(getNumberOfClientArray[1]);

        data.turn = data.turn === player2 || !data.turn ? player1 : player2;

        if (getNumberOfClient.size === 2) {
          this.emitToRoom(roomName, "game_played", data);
        }
      }
    );
  }

  private handleChatting(roomName: string, socket: Socket) {
    this.on(socket, "chat", ({ userName, msg }) => {
      this.emitToRoom(roomName, "chat", { userName, msg });
    });
  }

  private handleRegister(socket: Socket) {
    this.on(socket, "register", async ({ userId }: { userId: string }) => {
      this.customIdToSocketId.set(userId as string, socket.id);
    });
  }

  private async emitNumberOfClient(socket: Socket, roomName: string) {
    try {
      const clients = await this.getNumberOfClient(roomName);
      socket.emit("number_of_clients", { roomName, count: clients.size });
    } catch (error) {
      throw new ApiError({
        status: 400,
        message: `Failed to get number of clients in room ${roomName}. ${error}`,
      });
    }
  }
}
