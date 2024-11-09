export declare type User = {
  userId: string;
  userName: string;
  tic_tac_toe_high_score: number;
};

export declare type Room = {
  id: string;
  name: string;
  password: string;
  creator?: string;
  type: ROOM_TYPE;
  activeUsers: string;
};

export declare type WinStatusType = {
  isWin: boolean;
  player: string;
  playerId?: string;
};

export const enum ROOM_TYPE {
  PUBLIC = "public",
  PRIVATE = "private",
}
