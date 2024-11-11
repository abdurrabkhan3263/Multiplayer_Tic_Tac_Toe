import redis from "../db/client";
import { ApiError } from "../utils/ErrorHandler";
import server from "../server";
import { Socket, Server, Namespace } from "socket.io";
import {
  AvailableListRooms,
  GameError,
  JoinRoom,
  PlayGame,
  Room,
  RoomResponse,
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

        rooms.forEach(async (room) => {
          if (room !== socket.id) {
            this.EmitPlayerLeft(socket, room);
            await redis.del(`room:${room}`);
          }
        });
      });

      socket.on("disconnect", () => {
        const mappedSocket = this.customIdToSocketId.get(socket.id);

        if (mappedSocket) {
          const rooms = Array.from(socket.rooms);
          this.customIdToSocketId.delete(socket.id);

          console.log("user disconnecting:", socket.id, { rooms });

          rooms.forEach(async (room) => {
            if (room !== socket.id) {
              this.EmitPlayerLeft(socket, room);
              await redis.del(`room:${room}`);
            }
          });
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

  findAvailableRoom(): AvailableListRooms[] {
    const availableRooms: AvailableListRooms[] = [];
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

  async updateAndJoinRoom(
    socket: Socket,
    userId: string,
    findThatRoom: RoomResponse,
    roomId: string
  ) {
    findThatRoom.clientCount += 1;
    const roomName = findThatRoom.roomName;

    const activeUsersArray = JSON.parse(findThatRoom.activeUsers);
    activeUsersArray.push(userId);

    try {
      const updateRoom = await redis.hSet(roomId, {
        ...findThatRoom,
        activeUsers: JSON.stringify(activeUsersArray),
      });

      socket.join(roomId);
      this.joinedEmitter(socket, roomId);
      this.handleRegister({ socketId: socket.id, userId });

      if (updateRoom === null || updateRoom === undefined) {
        this.emitGameError({
          socket,
          message: "Failed to update room",
          data: { roomName },
        });
        return;
      }
    } catch (error) {
      console.error("Something went wrong", error);
      this.emitGameError({
        socket,
        message: "Failed to update room",
        data: { roomName },
      });
      return;
    }
  }

  async createRoom(socket: Socket, user: User) {
    const id = uuid();
    const roomId = `room:${id}`;

    try {
      const insertIntoRedis = await redis.hSet(roomId, {
        roomId: id,
        roomName: "Random_room",
        type: "public",
        activeUsers: JSON.stringify([user.userId]),
        clientCount: 1,
      });

      if (!insertIntoRedis) {
        this.emitGameError({
          socket,
          message: "Failed to create room",
          data: { roomId },
        });
        return;
      }

      await redis.expire(roomId, 60 * 10); // 10 minutes
    } catch (error) {
      this.emitGameError({
        socket,
        message: "Failed to create room",
        data: { roomId },
      });
      return;
    }

    socket.join(roomId);
    this.joinedEmitter(socket, roomId);
    this.handleRegister({ socketId: socket.id, userId: user.userId });
  }

  //  method for handling game logic

  async playGame() {
    this.connection((socket: Socket) => {
      // Handle Player Rejoin into room
      this.handlePlayerRejoin(socket);

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
      async ({ userId, roomName, password, id }: JoinRoom) => {
        console.log(
          { userId },
          "Joining into custom room",
          roomName,
          password,
          id
        );
        if (!userId || !roomName || !password || !id) {
          this.emitGameError({
            socket,
            message: "Invalid data",
            data: { userId, roomName, password, id },
          });
          return;
        }

        try {
          const roomId = `room:${id}`;
          const numberOfClient = this.getNumberOfClient(roomId);

          if (numberOfClient.size >= 2) {
            this.emitGameError({
              socket,
              message: "Room is full",
              data: { roomName },
            });
            return;
          }
          const findRoomRaw = await redis.hGetAll(roomId);

          const findThatRoom: RoomResponse = {
            roomId: findRoomRaw.roomId,
            roomName: findRoomRaw.roomName,
            password: findRoomRaw.password,
            activeUsers: findRoomRaw.activeUsers,
            clientCount: parseInt(findRoomRaw.clientCount),
            type: findRoomRaw.type as "public" | "private",
          };

          if (!findRoomRaw) {
            this.emitGameError({
              socket,
              message: "Room not found",
              data: { roomName },
            });
            return;
          }

          if (findThatRoom.password !== password) {
            this.emitGameError({
              socket,
              message: "Invalid password",
              data: { roomName },
            });
            return;
          }

          const activeUsers = JSON.parse(findThatRoom.activeUsers);

          if (activeUsers.includes(userId)) {
            socket.join(roomId);
          } else {
            await this.updateAndJoinRoom(socket, userId, findThatRoom, roomId);
          }

          if (numberOfClient.size >= 2) {
            this.emitGameStart(socket, roomId);
          }
        } catch (error) {
          console.error("Something went wrong", error);
          this.emitGameError({
            socket,
            message: "Failed to join room",
            data: { roomName },
          });
        }
      }
    );
  }

  private handleJoinIntoRoom(socket: Socket) {
    this.on(socket, "join_into_room", async (user: User) => {
      const availableRooms = this.findAvailableRoom();

      if (availableRooms.length === 0) {
        this.createRoom(socket, user);
      } else {
        const findRoom = availableRooms.find(
          (room) => room.clientCount === 1 || room.clientCount === 0
        );

        if (findRoom) {
          const roomId = findRoom.room;

          const findRoomIntoRedis = await redis.hGetAll(roomId);

          if (!findRoomIntoRedis) {
            this.emitGameError({
              socket,
              message: "Room not found",
              data: { roomId },
            });
            return;
          }

          const findThatRoom: RoomResponse = {
            roomId: findRoomIntoRedis.roomId,
            roomName: findRoomIntoRedis.roomName ?? "Random_room",
            password: findRoomIntoRedis.password ?? "",
            activeUsers: findRoomIntoRedis.activeUsers,
            clientCount: parseInt(findRoomIntoRedis.clientCount),
            type: findRoomIntoRedis.type as "public" | "private",
          };

          await this.updateAndJoinRoom(
            socket,
            user.userId,
            findThatRoom,
            roomId
          );

          if (findRoom.clientCount === 1) {
            this.emitGameStart(socket, findRoom.room);
          }
        } else {
          await this.createRoom(socket, user);
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

  private handlePlayerRejoin(socket: Socket) {
    this.on(socket, "rejoin_into_room", async ({ userId, roomId }) => {
      const room = `room:${roomId}`;

      const findThatRoom = await redis.hGetAll(room);

      if (!findThatRoom) {
        this.emitGameError({
          socket,
          message: "Room not found or room is expired",
          data: { roomId },
        });
        return;
      }

      const activeUser = JSON.parse(findThatRoom.activeUsers);

      if (activeUser.includes(userId)) {
        socket.join(room);
        this.handleRegister({ socketId: socket.id, userId });
        this.joinedEmitter(socket, room);
      } else {
        this.emitGameError({
          socket,
          message: "User not found in room",
          data: { roomId },
        });
      }
    });
  }

  // TODO : Refactor this method --> Decide how to handle the game logic or event

  private handlePlayEvent(socket: Socket) {
    this.on(
      socket,
      "game_playing",
      async ({ roomId, userId, data }: PlayGame) => {
        const getNumberOfClient = this.getNumberOfClient(roomId);
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
          this.emitToRoom(roomId, "game_playing", data);
        }
      }
    );
  }

  private handlePlayGame(socket: Socket) {
    this.on(socket, "play_game", async ({ roomId, userId }: PlayGame) => {
      socket.join(roomId);

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
        roomId,
      };

      this.emitToRoom(roomId, "game_started", data);
    });
  }

  private handlePlayerLeft(socket: Socket) {
    console.log("Player left the room");
    this.on(socket, "player_left", ({ roomName }) => {
      console.log("Player left the room", roomName);
      this.EmitPlayerLeft(socket, roomName);

      this.leaveRoom(socket, roomName);
    });
  }

  private handleGameOver(socket: Socket) {
    this.on(socket, "game_over", async ({ data }: any) => {
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

  private emitGameError({ socket, message, data }: GameError) {
    socket.emit("game_error", {
      success: false,
      message,
      data,
    });
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
