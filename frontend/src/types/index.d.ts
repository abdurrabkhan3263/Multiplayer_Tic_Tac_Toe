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
  clientCount: string;
  type: ROOM_TYPE;
};

export declare type WinStatusType = {
  isDraw: boolean | undefined;
  isWin: boolean | undefined;
  playerName: string;
  playerId?: string;
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

export declare type ToggleTurn = {
  boxId: number;
  turn: string;
  userId: string;
};

export declare type GameComplete = {
  roomId: string;
};
