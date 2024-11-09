import { io } from "socket.io-client";

export const socket = io("/game", {
  autoConnect: false,
  transports: ["websocket"],
  reconnectionAttempts: 3,
});
