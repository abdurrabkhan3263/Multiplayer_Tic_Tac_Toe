import React, {
  createContext,
  useEffect,
  useContext,
  useState,
  useRef,
} from "react";
import { socket } from "@/lib/socket.ts";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";
import { getUser } from "@/lib/action/user.action";
import BackgroundMusic from "@/components/BackgroundMusic";

interface SocketContextType {
  socket: typeof socket;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  dbRef: React.MutableRefObject<IDBDatabase | null>;
  music: boolean;
  setMusic: React.Dispatch<React.SetStateAction<boolean>>;
}

const SocketContext = createContext<SocketContextType>({
  socket,
  user: null,
  setUser: () => {},
  dbRef: { current: null },
  music: true,
  setMusic: () => {},
});

export const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const dbRef = useRef<IDBDatabase | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [music, setMusic] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await getUser();
        setUser(user);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error?.message : "Something went wrong",
          variant: "destructive",
        });
      }
    })();
  }, [toast]);

  useEffect(() => {
    if (!socket.connected && user?.userId) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("Connected to socket server");
      socket.emit("register", { userId: user?.userId });
    };

    const handleDisconnect = () => {
      console.log("Disconnected from socket server");
    };

    const handleError = (err: Error) => {
      console.error(`Connection error: ${err.message}`);
      toast({
        title: "Connection Error",
        description: `Failed to connect to the server: ${err.message}`,
        variant: "destructive",
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
    };
  }, [toast, user?.userId]);

  useEffect(() => {
    if (localStorage.getItem("music")) {
      setMusic(JSON.parse(localStorage.getItem("music") as string));
    }
  }, [setMusic]);

  return (
    <SocketContext.Provider
      value={{ socket, user, setUser, dbRef, music, setMusic }}
    >
      <BackgroundMusic music={music} />
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
