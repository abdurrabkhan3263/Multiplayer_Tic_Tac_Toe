import redis from "../db/client";
import server from "../server";
import { Socket, Server, Namespace } from "socket.io";
import {
  AvailableListRooms,
  GameError,
  GameStart,
  JoinRoom,
  PlayGame,
  RoomResultResponse,
  User,
} from "../types";
import { v4 as uuid } from "uuid";
import { playerSymbol, WINNING_PATTERN } from "../lib/consts";

interface PlayerInfo {
  userId: string;
  socketId: string;
  symbol: "X" | "O";
  userName?: string;
  active: boolean;
}

interface GameState {
  board: string[];
  currentTurn: string;
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED";
  player1?: PlayerInfo;
  player2?: PlayerInfo;
  roomId: string;
  createdAt: number;
  [key: string]: any;
}

export default class SocketController {
  private io: Namespace;
  public socket: Server;

  private gameRooms: Map<string, GameState> = new Map();
  private userToRoomMapping: Map<string, string> = new Map();
  private socketToUserMapping: Map<string, string> = new Map();

  constructor() {
    this.socket = new Server(server, {
      connectionStateRecovery: {},
    });
    this.io = this.socket.of("/game");

    setInterval(() => this.cleanupStaleRooms(), 30 * 60 * 1000);
  }

  // ? method for handling socket connection

  async connection(callback: (socket: Socket) => void) {
    this.io.on("connection", (socket: Socket) => {
      callback(socket);

      socket.on("disconnecting", async () => {
        const rooms = Array.from(socket.rooms);
        for (const room of rooms) {
          if (room !== socket.id) {
            await this.handlePlayerDisconnect(socket, room);
          }
        }
      });

      socket.on("disconnect", () => {
        this.cleanupStaleRooms();
      });
    });
  }

  private cleanupStaleRooms() {
    const now = Date.now();

    for (const [roomId, gameState] of this.gameRooms) {
      if (
        now - gameState.createdAt > 30 * 60 * 1000 ||
        gameState.status === "COMPLETED"
      ) {
        if (gameState.player1) {
          this.userToRoomMapping.delete(gameState.player1.userId);
        }

        if (gameState.player2) {
          this.userToRoomMapping.delete(gameState.player2.userId);
        }
      }
    }
  }

  private async handlePlayerDisconnect(socket: Socket, roomId: string) {
    const gameState = this.gameRooms.get(roomId);

    if (!gameState) return;

    // Remove player from room

    if (gameState.player1 && gameState.player1.socketId === socket.id) {
      gameState.player1.active = false;
    }
    if (gameState.player2 && gameState.player2.socketId === socket.id) {
      gameState.player2.active = false;
    }

    // Remove from user to room mapping
    const userId = this.userToRoomMapping.get(socket.id);
    if (userId) {
      this.userToRoomMapping.delete(userId);
    }
    this.socketToUserMapping.delete(socket.id);

    if (gameState.player1 === undefined && gameState.player2 === undefined) {
      this.gameRooms.delete(roomId);
      await redis.del(roomId);
    }
  }

  // ? Socket Helper Methods

  private async on(
    socket: Socket,
    event: string,
    callback: (data: any) => void
  ) {
    socket.on(event, callback);
  }

  private async emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  private async leaveRoom(socket: Socket, room: string) {
    const userId = this.socketToUserMapping.get(socket.id);
    const gameData = this.gameRooms.get(room);

    if (userId) {
      this.userToRoomMapping.delete(userId);
    }
    this.socketToUserMapping.delete(socket.id);

    if (gameData?.player1?.socketId === socket.id) {
      gameData.player1 = undefined;
    } else if (gameData?.player2?.socketId === socket.id) {
      gameData.player2 = undefined;
    }

    if (gameData?.player1 === undefined && gameData?.player2 === undefined) {
      this.gameRooms.delete(room);
      await redis.del(room);
    }

    this.emit_playerLeft(room);
    socket.leave(room);
  }

  // ? Room Methods

  private findAvailableRoom(): AvailableListRooms[] {
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

  private async getRoomFromRedis({ roomId }: { roomId: string }) {
    const findRoom = await redis.hGetAll(roomId);

    if (!findRoom) {
      return null;
    }
    return {
      roomId: findRoom.roomId,
      roomName: findRoom.roomName,
      password: findRoom.password,
      activeUsers: JSON.parse(findRoom.activeUsers),
      clientCount: parseInt(findRoom.clientCount),
      type: findRoom.type as "public" | "private",
    };
  }

  private async createRoom(socket: Socket, user: User) {
    const roomId = `room:${uuid()}`;

    try {
      const initialState: GameState = {
        board: Array(9).fill(""),
        currentTurn: "",
        status: "WAITING",
        roomId: roomId,
        createdAt: Date.now(),
        player1: {
          socketId: socket.id,
          userId: user.userId,
          symbol: "X",
          userName: user.userName,
          active: true,
        },
        player2: undefined,
      };

      this.gameRooms.set(roomId, initialState);
      this.userToRoomMapping.set(user.userId, roomId);

      await redis.hSet(roomId, {
        roomId,
        roomName: "Random_room",
        type: "public",
        status: "WAITING",
        createdAt: Date.now().toString(),
        playerCount: 1,
      });

      await redis.expire(roomId, 60 * 10);

      socket.join(roomId);
      this.emit_joinedIntoRoom(roomId);
    } catch (error) {
      this.emit_gameError({
        socket,
        message: "Failed to create room",
        data: { roomId },
      });
    }
  }

  private checkGameStatus(board: string[], userId: string) {
    for (const pattern of WINNING_PATTERN) {
      const [a, b, c] = pattern;

      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        return {
          status: "win",
          userId,
        };
      }
    }

    if (board.every((box) => box !== "")) {
      return {
        status: "draw",
      };
    }

    return null;
  }

  // ?  Initialize Game

  async playGame() {
    this.connection((socket: Socket) => {
      // Register User
      this.handler_register(socket);

      // Handle Joining into CustomRoom room
      this.handleJoinIntoCustomRoom(socket);

      // Handle Joining into room
      this.handleJoinIntoRoom(socket);

      // Handle Player Left
      this.handler_playerLeft(socket);

      // Handle Play Again
      this.handler_playAgain(socket);

      // Handle Game Start
      this.handler_rejoinIntoRoom(socket);

      // Handle Play Event
      this.handler_playerMove(socket);

      // Handle Chatting
      this.handler_chatting(socket);
    });
  }

  // ? Joining into Room Methods

  private handleJoinIntoCustomRoom(socket: Socket) {
    this.on(
      socket,
      "join_into_custom_room",
      async ({ user, roomName, password, id }: JoinRoom) => {
        if (!user || !roomName || !id) {
          this.emit_gameError({
            socket,
            message: "Invalid data",
            data: {},
          });
          return;
        }

        try {
          const roomId = `room:${id}`;
          const gameData = this.gameRooms.get(roomId);

          if (gameData && gameData.status !== "WAITING") {
            this.emit_gameError({
              socket,
              message: "Room is already full",
              data: { roomName },
            });
            return;
          }

          const findRoom = await this.getRoomFromRedis({ roomId });

          if (!findRoom) {
            this.emit_gameError({
              socket,
              message: "Room not found",
              data: { roomName },
            });
            return;
          }

          if (findRoom.password && findRoom.password !== password) {
            this.emit_gameError({
              socket,
              message: "Invalid password",
              data: { roomName },
            });
            return;
          }

          if (!gameData) {
            this.createRoom(socket, user);
          } else {
            gameData.player2 = {
              socketId: socket.id,
              userId: user.userId,
              symbol: "O",
              userName: user?.userName,
              active: true,
            };
            gameData.status = "IN_PROGRESS";

            if (!gameData.player1) return;

            gameData.currentTurn =
              Math.random() < 0.5
                ? gameData.player1.userId
                : gameData.player2.userId;

            await redis.hIncrBy(roomId, "playerCount", 1);

            this.userToRoomMapping.set(user?.userId, roomId);

            socket.join(roomId);
            this.emit_gameStart(roomId);
          }
        } catch (error) {
          this.emit_gameError({
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
        return this.createRoom(socket, user);
      }

      const suitableRoom = availableRooms.find(
        (room) => room.clientCount === 1
      );

      if (suitableRoom) {
        const roomId = suitableRoom.room;
        const gameState = this.gameRooms.get(roomId);

        if (!gameState) {
          this.emit_gameError({
            socket,
            message: "Room not found",
            data: { roomId },
          });
          return null;
        }

        gameState.player2 = {
          socketId: socket.id,
          userId: user.userId,
          symbol: "O",
          userName: user.userName,
          active: true,
        };
        gameState.status = "IN_PROGRESS";
        gameState.currentTurn =
          Math.random() < 0.5
            ? gameState.player1?.userId!
            : gameState.player2?.userId!;

        this.userToRoomMapping.set(user.userId, roomId);

        socket.join(roomId);
        this.emit_gameStart(gameState.roomId);
      } else {
        await this.createRoom(socket, user);
      }
    });
  }

  // ? Event Handlers

  private handler_register(socket: Socket) {
    this.on(socket, "register", ({ userId }: { userId: string }) => {
      if (!userId) return;

      this.socketToUserMapping.set(socket.id, userId);
    });
  }

  private handler_playerMove(socket: Socket) {
    this.on(socket, "player_move", async ({ roomId, boxId }: PlayGame) => {
      const gameState = this.gameRooms.get(roomId);
      const userId = this.socketToUserMapping.get(socket.id);

      if (!gameState || gameState.status !== "IN_PROGRESS") {
        this.emit_gameError({
          socket,
          message: "Invalid game state",
          data: { roomId },
        });
        return;
      }

      if (gameState.currentTurn !== userId) {
        this.emit_gameError({
          socket,
          message: "Not your turn",
          data: { roomId },
        });
        return;
      }

      const player =
        gameState.player1?.userId === userId ? "player1" : "player2";

      gameState.board[boxId] = gameState[player]?.symbol!;
      gameState.currentTurn =
        player === "player1"
          ? gameState?.player2?.userId!
          : gameState?.player1?.userId!;

      const gameResult = this.checkGameStatus(gameState.board, userId);

      if (gameResult) {
        this.emit_gameResult(roomId, gameResult as RoomResultResponse);
        gameState.status = "COMPLETED";
        gameState.currentTurn = userId;
        return;
      }

      this.emit_playerMove(roomId, gameState);
    });
  }

  private handler_rejoinIntoRoom(socket: Socket) {
    this.on(socket, "rejoin_room", async ({ roomId, userId }: GameStart) => {
      const gameState = this.gameRooms.get(roomId);
      console.log({ roomId, userId });

      if (!gameState) {
        this.emit_gameError({
          socket,
          message: "Room not found",
          data: { roomId },
        });
        return;
      }

      [gameState.player1, gameState.player2].forEach((player) => {
        if (player && player?.userId === userId) {
          player.socketId = socket.id;
          player.active = true;
          this.userToRoomMapping.set(userId, roomId);
          this.socketToUserMapping.set(socket.id, userId);
        }
      });

      socket.join(roomId);
      this.emit_gameStarted(roomId, gameState);
    });
  }

  private handler_playerLeft(socket: Socket) {
    this.on(socket, "player_left", (roomId) => {
      this.leaveRoom(socket, roomId);
    });
  }

  private handler_playAgain(socket: Socket) {
    this.on(socket, "play_again", async (roomId: string) => {
      const gameState = this.gameRooms.get(roomId);

      if (!gameState) {
        this.emit_gameError({
          socket,
          message: "Room not found",
          data: { roomId },
        });
        return;
      }

      gameState.board = Array(9).fill("");
      gameState.status = "IN_PROGRESS";

      this.emit_playAgain(roomId, gameState);
    });
  }

  private handler_chatting(socket: Socket) {
    this.on(socket, "chat", ({ userName, msg, roomName }) => {
      this.emitToRoom(roomName, "chat", { userName, msg });
    });
  }

  // ? Emitters

  private emit_gameError({ socket, message, data }: GameError) {
    socket.emit("game_error", {
      success: false,
      message,
      data,
    });
  }

  private emit_playerLeft(roomId: string) {
    this.emitToRoom(roomId, "player_left", {
      message: "player left the room",
    });
  }

  private emit_gameStart(roomId: string) {
    this.emitToRoom(roomId, "match_found", roomId);
  }

  private emit_joinedIntoRoom(roomId: string) {
    this.emitToRoom(roomId, "emit_joined_into_room", roomId);
  }

  private emit_gameResult(roomId: string, data: RoomResultResponse) {
    this.emitToRoom(roomId, "game_status", data);
  }

  private emit_playAgain(roomId: string, data: GameState) {
    this.emitToRoom(roomId, "play_again", data);
  }

  private emit_gameStarted(roomId: string, data: GameState) {
    this.emitToRoom(roomId, "game_started", data);
  }

  private emit_playerMove(roomId: string, gameState: GameState) {
    this.emitToRoom(roomId, "player_move", gameState);
  }
}
