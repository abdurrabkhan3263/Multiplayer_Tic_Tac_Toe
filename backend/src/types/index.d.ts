import { Socket } from "socket.io";

export declare type Response = {
  statusCode: number;
  message: string;
  data?: any;
};

export declare type CreateRoom = {
  userId: string;
  name: string;
  password: string;
};

export declare type Room = {
  roomName: string;
};

export declare type JoinRoom = {
  roomId: string;
  userId: string;
  roomName: string;
  password: string;
};

export declare type RoomData = {
  data: any;
};

export declare type GameData = {
  turn: string;
  boardData: [];
};

export declare type PlayGame = {
  roomId: string;
  userId: string;
  data: any;
};

export declare type RoomType = {
  name: string;
  password: string;
  activeUsers: string;
  creator: string;
  type: "public" | "private";
};

export declare type User = {
  userId: string;
  userName: string;
  tic_tac_toe_high_score: number;
};

export declare type RoomList = {
  room: string;
  clients: string[];
  clientCount: number;
};

export declare type GameError = {
  socket: Socket;
  message: string;
  data?: any;
};

export const enum ROOM_TYPE {
  PUBLIC = "public",
  PRIVATE = "private",
}
