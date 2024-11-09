import expess from "express";
import { ResponseHandler } from "../utils/ResponseHandler";
import redis from "../db/client";
import { AsyncHandler } from "../utils/AsyncHanlder";
import { ApiError } from "../utils/ErrorHandler";
import server from "../server";
import { Socket, Server, Namespace } from "socket.io";
import {
  JoinRoom,
  PlayGame,
  Room,
  RoomData,
  RoomList,
  RoomType,
  User,
} from "../types";
import { v4 as uuid } from "uuid";

export default class SocketController {
  public io: Namespace;
  public socket: Server;
  public customIdToSocketId: Map<string, string> = new Map();

  constructor() {
    this.socket = new Server(server);
    this.io = this.socket.of("/game");
  }

  //   method for handling socket connection

  async connection(callback: (socket: Socket) => void) {
    this.io.on("connection", (socket: Socket) => {
      console.log("a user connected", socket.id);

      callback(socket);

      socket.on("disconnecting", () => {
        const rooms = Array.from(socket.rooms);

        console.log("user disconnecting:", socket.id, { rooms });

        rooms.forEach((room) => {
          if (room !== socket.id) {
            this.EmitPlayerLeft(socket, room);
          }
        });
      });

      socket.on("disconnect", () => {
        const mappedSocket = this.customIdToSocketId.get(socket.id);

        if (mappedSocket) {
          this.customIdToSocketId.delete(socket.id);
        }

        console.log("user disconnected:", socket.id);
      });
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

  getNumberOfClient(room: string): Set<string> {
    const clients = this.io.adapter.rooms.get(room);

    return clients || new Set<string>();
  }

  async incrementScore(userId: string, score: number) {
    try {
      await redis.incrBy(`user:${userId}:tic_tac_toe_high_score`, score);
    } catch (error) {
      throw new ApiError({
        status: 400,
        message: "Failed to increment score",
      });
    }
  }

  findAvailableRoom(): RoomList[] {
    const availableRooms: RoomList[] = [];
    const rooms = this.io.adapter.rooms;
    this.io.fetchSockets();

    if (rooms) {
      rooms.forEach((value, key) => {
        if (!this.io.sockets.has(key)) {
          availableRooms.push({
            room: key,
            clients: Array.from(value),
            clientCount: value.size,
          });
        }
      });
    }

    return availableRooms;
  }

  //  method for handling game logic

  async playGame() {
    this.connection((socket: Socket) => {
      // Handle Joining into CustomRoom room
      this.handleJoinIntoCustomRoom(socket);

      // Handle Joining into room
      this.handleJoinIntoRoom(socket);

      // Handle Game Over
      this.handleGameOver(socket);

      // Handle Player Left
      this.handlePlayerLeft(socket);

      // Handle Play Again
      this.handlePlayAgain(socket);

      // Handle Play Game
      this.handlePlayGame(socket);

      // Handle Play Event
      this.handlePlayEvent(socket);

      // Handle Chatting
      this.handleChatting(socket);

      // Handle Player Left
      this.handlePlayerLeft(socket);
    });
  }

  // Separate the game logic from the socket connection logic

  private handleJoinIntoCustomRoom(socket: Socket) {
    this.on(
      socket,
      "join_into_custom_room",
      async ({ userId, roomName, password, roomId }: JoinRoom) => {
        console.log("Joining into custom room:- ", {
          userId,
          roomName,
          password,
          roomId,
        });

        if (!userId || !roomName || !password || !roomId) {
          this.emitToRoom(roomName, "game_error", "Invalid data");
          return;
        }

        const room = `${roomName.toLowerCase()}:${roomId}`;
        const numberOfClient = this.getNumberOfClient(room);

        if (numberOfClient.size >= 2) {
          console.log("Room is full");
          this.emitToRoom(room, "game_error", "Room is full");
          return;
        }

        const findThatRoom = await redis.hGetAll(`room:${roomId}`);

        if (!findThatRoom) {
          this.emitToRoom(room, "game_error", "Room not found");
          return;
        }

        if (findThatRoom.password !== password) {
          this.emitToRoom(room, "game_error", "Invalid password");
          return;
        }

        socket.join(room);
        this.handleRegister({ socketId: socket.id, userId });
        this.joinedEmitter(socket, room);

        const updateRoom = await redis.hSet(`room:${roomId}`, {
          ...findThatRoom,
          clients: JSON.stringify([...numberOfClient, userId]),
        });

        if (!updateRoom) {
          this.emitToRoom(room, "game_error", "Failed to update room");
          socket.leave(room);
          return;
        }

        if (numberOfClient.size >= 2) {
          this.emitGameStart(socket, room);
        }
      }
    );
  }

  private handleJoinIntoRoom(socket: Socket) {
    this.on(socket, "join_into_room", async (data: { user: User }) => {
      const availableRooms = this.findAvailableRoom();

      this.handleRegister({ socketId: socket.id, userId: data.user.userId });

      if (availableRooms.length === 0) {
        const id = uuid();
        const roomName = id;

        socket.join(roomName);

        this.joinedEmitter(socket, roomName);
      } else {
        const findRoom = availableRooms.find(
          (room) =>
            (room.clientCount === 1 || room.clientCount === 0) &&
            room.clients[0] !== data.user.userId
        );

        if (!findRoom) {
          const id = uuid();
          const roomName = `customRoom${id}`;
          socket.join(`customRoom${id}`);

          this.joinedEmitter(socket, roomName);
        } else {
          socket.join(findRoom.room);
          this.joinedEmitter(socket, findRoom.room);

          if (findRoom.clientCount === 1) {
            this.emitGameStart(socket, findRoom.room);
          }
        }
      }
    });
  }

  private joinedEmitter(socket: Socket, roomName: string) {
    this.emitToRoom(roomName, "emit_joined_into_room", {
      roomName,
    });
    this.emitNumberOfClient(socket, roomName);
  }

  // TODO : Refactor this method --> Decide how to handle the game logic or event

  private handlePlayEvent(socket: Socket) {
    this.on(
      socket,
      "game_playing",
      async ({ roomName, userId, data }: PlayGame) => {
        const getNumberOfClient = this.getNumberOfClient(roomName);
        const getNumberOfClientArray = Array.from(getNumberOfClient);

        const player1 = this.customIdToSocketId.get(getNumberOfClientArray[0]);
        const player2 = this.customIdToSocketId.get(getNumberOfClientArray[1]);

        if (!player1 || !player2) {
          throw new ApiError({
            status: 400,
            message: "Players not found",
          });
        }

        data.turn = data.turn === player2 || !data.turn ? player1 : player2;

        if (getNumberOfClient.size === 2) {
          this.emitToRoom(roomName, "game_playing", data);
        }
      }
    );
  }

  private handlePlayGame(socket: Socket) {
    this.on(socket, "play_game", async ({ roomId, userId }: PlayGame) => {
      const getNumberOfClient = this.getNumberOfClient(roomId);
      const getNumberOfClientArray = Array.from(getNumberOfClient);

      const player1 = this.customIdToSocketId.get(getNumberOfClientArray[0]);
      const player2 = this.customIdToSocketId.get(getNumberOfClientArray[1]);
      const randomPlayer = Math.floor(Math.random() * 2);
      const gameVal = randomPlayer === 0 ? "X" : "O";

      if (!player1 || !player2) {
        throw new ApiError({
          status: 400,
          message: "Players not found",
        });
      }

      const data = {
        [player1]: gameVal,
        [player2]: gameVal === "X" ? "O" : "X",
        roomName,
      };

      this.emitToRoom(roomName, "game_started", data);
    });
  }

  private handlePlayerLeft(socket: Socket) {
    this.on(socket, "player_left", ({ roomName }: Room) => {
      this.EmitPlayerLeft(socket, roomName);

      this.leaveRoom(socket, roomName);
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
        await this.incrementScore(data.winner, 5);
      } else if (data.draw) {
        await this.incrementScore(data.player1, 1);
        await this.incrementScore(data.player2, 1);
      }

      this.emitToRoom(data.roomName, "game_over", {
        parsedPlayer1,
        parsedPlayer2,
        winner: data.winner ?? null,
        draw: data.draw ?? null,
      });
    });
  }

  private handlePlayAgain(socket: Socket) {
    this.on(socket, "playAgain", async ({ roomName }: Room) => {
      const numberOfClients = this.getNumberOfClient(roomName);

      if (numberOfClients.size <= 1) {
        this.EmitPlayerLeft(socket, roomName);
      }
    });
  }

  private handleChatting(socket: Socket) {
    this.on(socket, "chat", ({ userName, msg, roomName }) => {
      this.emitToRoom(roomName, "chat", { userName, msg });
    });
  }

  private handleRegister({
    socketId,
    userId,
  }: {
    socketId: string;
    userId: string;
  }) {
    this.customIdToSocketId.set(socketId, userId);
  }

  private async emitNumberOfClient(socket: Socket, roomName: string) {
    try {
      const clients = this.getNumberOfClient(roomName);
      socket.emit("number_of_clients", { roomName, count: clients.size });
    } catch (error) {
      throw new ApiError({
        status: 400,
        message: `Failed to get number of clients in room ${roomName}. ${error}`,
      });
    }
  }

  private handleError(socket: Socket, error: string) {
    socket.emit("error", error);
  }

  private handleSuccess(socket: Socket, message: string) {
    socket.emit("success", message);
  }

  private EmitPlayerLeft(socket: Socket, roomName: string) {
    this.emitToRoom(roomName, "player_left", {
      message: "player left the room",
    });
  }

  private emitGameStart(socket: Socket, roomName: string) {
    this.emitToRoom(roomName, "match_found", {
      roomName,
      message: "game has started",
    });
  }
}
