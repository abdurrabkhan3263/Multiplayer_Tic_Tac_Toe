import { Socket } from "socket.io";

export declare type User = {
  userId: string;
  userName: string;
  tic_tac_toe_high_score: number;
};

export declare type Room = {
  roomId: string;
  roomName: string;
  type: "public" | "private";
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED";
  createdAt: Date;
  playerCount: number;
};

export declare type RoomResponse = {
  roomId: string;
  roomName: string;
  password: string;
  activeUsers: string;
  clientCount: number;
  type: "public" | "private";
};

export declare type AvailableListRooms = {
  room: string;
  clients: string[];
  clientCount: number;
};

export declare type Response = {
  statusCode: number;
  message: string;
  data?: any;
};

export declare type CreateRoom = {
  userId: string;
  roomName: string;
  password: string;
};

export declare type JoinRoom = {
  id: string;
  user: User;
  roomName: string;
  password: string;
};

export declare type GameData = {
  turn: string;
  boardData: [];
};

export declare type PlayGame = {
  roomId: string;
  boxId: number;
  userId: string;
};

export declare type GameStart = {
  userId?: string;
  roomId: string;
};

export declare type GameError = {
  socket: Socket;
  message: string;
  data?: any;
};

export declare type RoomResultResponse = {
  status: "winner" | "draw";
  userId?: string;
};

export const enum ROOM_TYPE {
  PUBLIC = "public",
  PRIVATE = "private",
}
