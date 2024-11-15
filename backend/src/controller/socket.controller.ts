import redis from "../db/client";
import { ApiError } from "../utils/ErrorHandler";
import server from "../server";
import { Socket, Server, Namespace } from "socket.io";
import {
  AvailableListRooms,
  GameError,
  GameStart,
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
      callback(socket);

      socket.on("disconnecting", () => {
        const rooms = Array.from(socket.rooms);

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

          rooms.forEach(async (room) => {
            if (room !== socket.id) {
              this.EmitPlayerLeft(socket, room);
              await redis.del(`room:${room}`);
            }
          });
        }

        this.customIdToSocketId.delete(socket.id);
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
    if (!findThatRoom) return;

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

      if (updateRoom === null || updateRoom === undefined) {
        this.emitGameError({
          socket,
          message: "Failed to update room",
          data: { roomName },
        });
        return;
      }
    } catch (error) {
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
  }

  //  method for handling game logic

  async playGame() {
    this.connection((socket: Socket) => {
      // Handle Registering
      this.handleRegister(socket);

      // Handle Joining into CustomRoom room
      this.handleJoinIntoCustomRoom(socket);

      // Handle Joining into room
      this.handleJoinIntoRoom(socket);

      // Handle Player Win or Lose
      this.handlePlayerWin(socket);

      // Handle Player Draw
      this.handleGameDraw(socket);

      // Handle Player Left
      this.handlePlayerLeft(socket);

      // Handle Play Again
      this.handlePlayAgain(socket);

      // Handle Game Start
      this.handleGameStart(socket);

      // Handle Play Event
      this.handlePlayEvent(socket);

      // Handle Chatting
      this.handleChatting(socket);
    });
  }

  // Separate the game logic from the socket connection logic

  private handleJoinIntoCustomRoom(socket: Socket) {
    this.on(
      socket,
      "join_into_custom_room",
      async ({ userId, roomName, password, id }: JoinRoom) => {
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

  // TODO : Refactor this method --> Decide how to handle the game logic or event

  private handlePlayEvent(socket: Socket) {
    this.on(
      socket,
      "player_turn",
      async ({ roomId, boxId, userId }: PlayGame) => {
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

        let turn: string | null = null;

        if (userId === player1) {
          turn = player2;
        } else if (userId === player2) {
          turn = player1;
        }

        this.emitToRoom(roomId, "player_turn", {
          boxId,
          turn,
        });
      }
    );
  }

  private handleGameStart(socket: Socket) {
    this.on(socket, "start_game", async ({ roomId }: GameStart) => {
      socket.join(roomId);

      const getNumberOfClient = this.getNumberOfClient(roomId);
      const getNumberOfClientArray = Array.from(getNumberOfClient);

      const player1 = this.customIdToSocketId.get(getNumberOfClientArray[0]);
      const player2 = this.customIdToSocketId.get(getNumberOfClientArray[1]);

      const randomPlayer = Math.floor(Math.random() * 2);
      const player1TurnValue = randomPlayer === 0 ? "X" : "O";
      const player2TurnValue = player1TurnValue === "X" ? "O" : "X";

      if (!player1 || !player2) {
        socket.emit("game_error", {
          success: false,
          message: "Players not found",
        });
        return;
      }

      const data = {
        [player1]: player1TurnValue,
        [player2]: player2TurnValue,
        turn: [player1, player2][randomPlayer],
      };

      this.emitToRoom(roomId, "game_started", data);
    });
  }

  private handlePlayerLeft(socket: Socket) {
    this.on(socket, "player_left", ({ roomId }) => {
      this.EmitPlayerLeft(socket, roomId);
      this.leaveRoom(socket, roomId);
    });
  }

  private handlePlayAgain(socket: Socket) {
    this.on(socket, "play_again", async ({ roomId }: { roomId: string }) => {
      this.emitToRoom(roomId, "play_again", {});
    });
  }

  private handlePlayerWin(socket: Socket) {
    this.on(socket, "player_win", ({ userId, playerName }) => {
      const socketToUserId = Array.from(this.customIdToSocketId);

      const winnerSocketId = socketToUserId.find(
        ([_, id]) => id === userId
      )?.[0];
      const loserSocketId = socketToUserId.find(
        ([_, id]) => id !== userId
      )?.[0];

      if (!winnerSocketId || !loserSocketId) {
        socket.emit("game_error", {
          success: false,
          message: "Players not found",
        });
        return;
      }

      this.io.to(winnerSocketId).emit("game_win", {
        winner: playerName,
      });
      this.io.to(loserSocketId).emit("game_lose", {
        winner: playerName,
      });
    });
  }

  private handleGameDraw(socket: Socket) {
    this.on(socket, "game_draw", ({ roomId }) => {
      this.emitToRoom(roomId, "game_draw", {});
    });
  }

  private handleChatting(socket: Socket) {
    this.on(socket, "chat", ({ userName, msg, roomName }) => {
      this.emitToRoom(roomName, "chat", { userName, msg });
    });
  }

  private handleRegister(socket: Socket) {
    this.on(socket, "register", ({ userId }: { userId: string }) => {
      if (!userId) return;
      this.customIdToSocketId.set(socket.id, userId);
    });
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
