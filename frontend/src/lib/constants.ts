import { WinStatusType } from "@/types";

export const DB_NAME = "game_db";
export const DB_VERSION = 3;
export const DB_STORE = "currentUser";

export const SCORE_INC = 1;

export const INITIAL_WIN_STATUS: WinStatusType = {
  isWin: false,
  isDraw: false,
  isLose: false,
};

export const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;
