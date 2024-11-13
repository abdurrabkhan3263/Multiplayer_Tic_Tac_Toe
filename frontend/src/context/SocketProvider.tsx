import React, {
  createContext,
  useEffect,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";
import { socket } from "@/lib/socket.ts";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";
import { addUser, getUser } from "@/lib/action/user.action";
import { DB_NAME } from "@/lib/constants";
import { AxiosError } from "axios";

interface SocketContextType {
  socket: typeof socket;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  dbRef: React.MutableRefObject<IDBDatabase | null>;
}

const SocketContext = createContext<SocketContextType>({
  socket,
  user: null,
  setUser: () => {},
  dbRef: { current: null },
});
export const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dbRef = useRef<IDBDatabase | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const insertNewUser = useCallback(
    async ({ userName, userId }: { userName: string; userId?: string }) => {
      try {
        const res = await addUser({ userName, userId });

        if (res?.data) {
          return res.data;
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error?.message : "Something went wrong",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  useEffect(() => {
    const request = indexedDB.open(DB_NAME, 3);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("currentUser")) {
        const currentUserS = db.createObjectStore("currentUser", {
          keyPath: "userId",
        });
        currentUserS.createIndex("userName", "userName", { unique: true });
        currentUserS.createIndex(
          "tic_tac_toe_high_score",
          "tic_tac_toe_high_score",
          { unique: false },
        );
      }
    };

    request.onsuccess = async () => {
      dbRef.current = request.result;
      const transaction = dbRef.current.transaction("currentUser", "readonly");
      const store = transaction.objectStore("currentUser");

      dbRef.current.onversionchange = () => {
        dbRef.current?.close();
        toast({
          title: "Database is outdated",
          description: "Please refresh the page",
          variant: "destructive",
        });
      };

      store.getAll().onsuccess = async (event) => {
        const users = (event.target as IDBRequest).result as User[];
        setUser(users[0]);

        if (users.length > 0) {
          try {
            await getUser({ userId: users[0].userId });
          } catch (error) {
            const AxiosError = error as AxiosError;
            if (AxiosError.status === 404) {
              const newUser = await insertNewUser({
                userName: users[0].userName,
                userId: users[0].userId,
              });

              if (newUser && dbRef.current) {
                const transaction = dbRef.current.transaction(
                  "currentUser",
                  "readwrite",
                );
                const store = transaction.objectStore("currentUser");
                const cursorRequest = store.openCursor();

                cursorRequest.onsuccess = (event) => {
                  const cursor = (event.target as IDBRequest).result;

                  if (cursor) {
                    const updatedValue = {
                      ...cursor.value,
                      ...newUser,
                      userId: cursor.value.userId,
                    };
                    const updateRequest = cursor.update(updatedValue);

                    updateRequest.onsuccess = () => {
                      setUser(newUser);
                    };

                    updateRequest.onerror = () => {
                      console.error("Error updating user in IndexedDB");
                    };

                    cursor.continue();
                  }
                };
              }
            }
          }
        }
      };
    };
  }, [insertNewUser, toast]);

  useEffect(() => {
    if (user?.userId) {
      socket.connect();
    }

    socket.on("connect", () => {
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
  }, [navigate, toast, user]);

  return (
    <SocketContext.Provider value={{ socket, user, setUser, dbRef }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
