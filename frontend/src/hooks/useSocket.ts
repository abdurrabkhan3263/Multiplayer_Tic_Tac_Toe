import { useState, useEffect, useCallback } from "react";
import io, { Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = useCallback(() => {
    const newSocket = io("/room", {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("Failed to reconnect");
    });

    newSocket.connect();

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const cleanup = connectSocket();
    return () => {
      cleanup();
      if (socket) {
        socket.disconnect();
      }
    };
  }, [connectSocket, socket]);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  }, [socket]);

  return { socket, isConnected, reconnect };
};
