import { useState, useEffect, useCallback } from "react";
import io, { Socket } from "socket.io-client";

export const useSocketWithReconnect = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = useCallback(() => {
    const newSocket = io(url, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Connected with ID:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [url]);

  useEffect(() => {
    const cleanup = connectSocket();
    return cleanup;
  }, [connectSocket]);

  return { socket, isConnected };
};
