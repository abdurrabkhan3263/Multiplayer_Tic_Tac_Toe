import expess from "express";
import { ResponseHandler } from "../utils/ResponseHandler";
import redis from "../db/client";
import { AsyncHandler } from "../utils/AsyncHanlder";
import { ApiError } from "../utils/ErrorHandler";
import server from "../server";
import { Server } from "socket.io";

export class SocketController {
  private static instance: SocketController;
  public io: any;
  public socket: any;

  private constructor() {
    this.socket = new Server(server);
    this.io = this.socket.of("/game");
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SocketController();
    }

    return this.instance;
  }

  //   method for handling socket connection

  async connection(callback: () => void) {
    this.socket.of("/").on("connection", (socket: any) => {
      console.log("a user connected", socket.id);

      callback();
    });
  }

  async disconnect() {
    this.socket.on("disconnect", () => {
      console.log("a user disconnected");
    });
  }

  async emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  async on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }

  async emitToRoom(room: string, event: string, data: any) {
    this.socket.to(room).emit(event, data);
  }

  async getIntoRoom(room: string) {
    this.socket.join(room);
  }

  async leaveRoom(room: string) {
    this.socket.leave(room);
  }

  async playGame() {
    this.connection(() => {});
  }
}
