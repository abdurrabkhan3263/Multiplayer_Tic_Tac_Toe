export declare type User = {
  userId: string;
  userName: string;
  tic_tac_toe_high_score: number;
};

export declare type Room = {
  name: string;
  password: string;
  id: string;
};

export declare type WinStatusType = {
  isWin: boolean;
  player: string;
  playerId?: string;
};
