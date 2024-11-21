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
    if (user?.userId) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("register", { userId: user?.userId });
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
  }, [toast, user]);

  useEffect(() => {
    if (localStorage.getItem("music")) {
      setMusic(JSON.parse(localStorage.getItem("music") as string));
    }
  }, [setMusic]);

  return (
    <SocketContext.Provider
      value={{ socket, user, setUser, dbRef, music, setMusic }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
