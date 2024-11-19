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
import { playerSymbol } from "../lib/consts";

interface PlayerInfo {
  userId: string;
  socketId: string;
  symbol: "X" | "O";
  userName?: string;
}

interface GameState {
  board: string[];
  currentTurn: string;
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED";
  player1?: PlayerInfo;
  player2?: PlayerInfo;
  roomId: string;
  createdAt: number;
}

export default class SocketController {
  private io: Namespace;
  public socket: Server;

  private gameRooms: Map<string, GameState> = new Map();
  private userToRoomMapping: Map<string, string> = new Map();
  private socketToUserMapping: Map<string, string> = new Map();

  constructor() {
    this.socket = new Server(server);
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
      gameState.player1 = undefined;
    }
    if (gameState.player2 && gameState.player2.socketId === socket.id) {
      gameState.player2 = undefined;
    }

    // Remove from user to room mapping
    const userId = this.userToRoomMapping.get(socket.id);
    if (userId) {
      this.userToRoomMapping.delete(userId);
    }

    if (gameState.player1 === undefined && gameState.player2 === undefined) {
      this.gameRooms.delete(roomId);
      await redis.del(roomId);
    }
  }

  // ? Socket Helper Methods

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
    const userId = this.socketToUserMapping.get(socket.id);
    const gameData = this.gameRooms.get(room);

    if (userId) {
      this.userToRoomMapping.delete(userId);
    }
    this.socketToUserMapping.delete(socket.id);

    if (!gameData) return;

    if (gameData.player1?.socketId === socket.id) {
      gameData.player1 = undefined;
    } else if (gameData.player2?.socketId === socket.id) {
      gameData.player2 = undefined;
    }

    if (gameData.player1 === undefined && gameData.player2 === undefined) {
      this.gameRooms.delete(room);
      await redis.del(room);
    }

    socket.leave(room);
    this.emit_playerLeft(room);
  }

  // ? Room Methods

  private getRoomClients(room: string): Set<string> {
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

  async getRoomFromRedis({ roomId }: { roomId: string }) {
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
          symbol: playerSymbol[Math.floor(Math.random() * 2)] as "X" | "O",
          userName: user.userName,
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

      await redis.setEx(roomId, 60 * 10, JSON.stringify(initialState));

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

  // ?  Initialize Game

  async playGame() {
    this.connection((socket: Socket) => {
      // Handle Registering
      this.handleRegister(socket);

      // Handle Joining into CustomRoom room
      this.handleJoinIntoCustomRoom(socket);

      // Handle Joining into room
      this.handleJoinIntoRoom(socket);

      // Handle Player Win or Lose
      this.handler_gameWin(socket);

      // Handle Player Draw
      this.handler_gameDraw(socket);

      // Handle Player Left
      this.handler_playerLeft(socket);

      // Handle Play Again
      this.handler_playAgain(socket);

      // Handle Game Start
      this.handler_gameStart(socket);

      // Handle Play Event
      this.handler_playEvent(socket);

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
              symbol: gameData.player1?.symbol === "X" ? "O" : "X",
              userName: roomName,
            };
            gameData.status = "IN_PROGRESS";

            if (!gameData.player1) return;

            gameData.currentTurn =
              Math.random() < 0.5
                ? gameData.player1.userId
                : gameData.player2.userId;

            await redis.hSet(roomId, {
              ...findRoom,
              playerCount: 2,
            });

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
          symbol: gameState.player1?.symbol === "X" ? "O" : "X",
          userName: user.userName,
        };
        gameState.status = "IN_PROGRESS";

        if (!gameState.player1) return;

        gameState.currentTurn =
          Math.random() < 0.5
            ? gameState.player1.userId
            : gameState.player2.userId;

        this.userToRoomMapping.set(user.userId, roomId);

        socket.join(roomId);
        this.emitGameStart(socket, gameState.roomId);
      } else {
        await this.createRoom(socket, user);
      }
    });
  }

  // ? Event Handlers

  private handler_playEvent(socket: Socket) {
    this.on(
      socket,
      "player_turn",
      async ({ roomId, boxId, userId }: PlayGame) => {
        const getRoomClients = this.getRoomClients(roomId);
        const getNumberOfClientArray = Array.from(getRoomClients);

        const player1 = this.customIdToSocketId.get(getNumberOfClientArray[0]);
        const player2 = this.customIdToSocketId.get(getNumberOfClientArray[1]);

        if (!player1 || !player2) {
          socket.emit("game_error", {
            success: false,
            message: "Players not found",
          });
          return;
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

  private handler_gameStart(socket: Socket) {
    this.on(socket, "start_game", async ({ roomId }: GameStart) => {
      socket.join(roomId);

      const getRoomClients = this.getRoomClients(roomId);
      const getNumberOfClientArray = Array.from(getRoomClients);

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
        roomId,
      };

      this.emitToRoom(roomId, "game_started", data);
    });
  }

  private handler_playerLeft(socket: Socket) {
    this.on(socket, "player_left", ({ roomId }) => {
      this.emit_playerLeft(roomId);
      this.leaveRoom(socket, roomId);
    });
  }

  private handler_playAgain(socket: Socket) {
    this.on(socket, "play_again", async ({ roomId }: { roomId: string }) => {
      this.emitToRoom(roomId, "play_again", {});
    });
  }

  private handler_gameWin(socket: Socket) {
    this.on(socket, "player_win", ({ userId, playerName }) => {
      const socketToUserId = Array.from(this.customIdToSocketId);

      const winnerSocketId = socketToUserId.find(
        ([_, id]) => id === userId
      )?.[0];
      const loserSocketId = socketToUserId.find(
        ([_, id]) => id !== userId
      )?.[0];

      console.log("Server notify you win the game", userId, playerName, {
        winnerSocketId,
        loserSocketId,
      });
      console.log("Custom ID to Socket ID", this.customIdToSocketId);

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

  private handler_gameDraw(socket: Socket) {
    this.on(socket, "game_draw", ({ roomId }) => {
      this.emitToRoom(roomId, "game_draw", {});
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
}
