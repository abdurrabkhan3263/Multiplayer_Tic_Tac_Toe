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
  roomName: string;
  userId: string;
  data: any;
};

export declare type RoomType = {
  name: string;
  password: string;
  activeUsers: string;
  creator: string;
};
