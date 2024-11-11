import React, { createContext, useEffect, useContext } from "react";
import { socket } from "@/lib/socket.ts";
import { useToast } from "@/hooks/use-toast";

const SocketContext = createContext(socket);
export const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    socket.on("connect_error", (err) => {
      console.error(`Connection error: ${err.message}`);
      toast({
        title: "Connection Error",
        description: `Failed to connect to the server: ${err.message}`,
        variant: "destructive",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
