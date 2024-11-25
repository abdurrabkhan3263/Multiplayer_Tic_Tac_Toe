export declare type PlayerInfo = {
  userId: string;
  socketId: string;
  symbol: "X" | "O";
  userName?: string;
  active: boolean;
};

export declare type GameState = {
  board: string[];
  currentTurn: string;
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED";
  player1?: PlayerInfo;
  player2?: PlayerInfo;
  roomId: string;
  createdAt: number;
};

export declare type User = {
  userId: string;
  userName: string;
  tic_tac_toe_high_score: number;
};

export declare type Room = {
  roomId: string;
  roomName: string;
  password: string;
  activeUsers: string;
  playerCount: string;
  type: ROOM_TYPE;
  createdBy: string;
};

export declare type WinStatusType = {
  isDraw: boolean;
  isWin: boolean;
  isLose: boolean;
  playerName?: string;
};

export const enum ROOM_TYPE {
  PUBLIC = "public",
  PRIVATE = "private",
}

export declare type GameError = {
  status: boolean;
  message: string;
  data?: any;
};

export declare type Turn = {
  [key: string]: "X" | "O";
};

export declare type GameData = {
  [key: string]: "X" | "O";
  [key: string]: "X" | "O";
  turn: string;
};

export declare type GameComplete = {
  roomId: string;
};

export declare type PlayerWinMessage = {
  title: string;
  description: string;
};

export declare type RoomResult = {
  status: "win" | "draw";
  userId?: string;
};

export declare type OnlineGameData = {
  opponentName: string;
  ourSymbol: "X" | "O";
  opponentId: string;
};

export declare type Player = "X" | "O";
