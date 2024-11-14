import { useToast } from "@/hooks/use-toast";
import { getRoomById } from "@/lib/action/room.action";
import { DB_NAME } from "@/lib/constants";
import { User } from "@/types";
import { createContext, useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface RoomContextType {
  user: User | undefined;
  roomId: string;
}

interface RoomProviderProps {
  children: React.ReactNode;
}

export const RoomContext = createContext<RoomContextType>({
  user: undefined,
  roomId: "",
});

export const useRoomContext = () => useContext(RoomContext);

const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const [roomId, setRoomId] = useState<string>("");
  const [user, setUser] = useState<User | undefined>();
  const { toast } = useToast();
  const dbRef = useRef<IDBDatabase | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const roomId = window.location.pathname.split("/").pop();
      try {
        const findRoom = await getRoomById({ roomId: roomId ?? "" });

        if (findRoom?.data) {
          setRoomId(findRoom?.data?.roomId ?? "");
        } else {
          navigate("/home");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: (error as Error)?.message ?? "Something went wrong",
          variant: "destructive",
        });
        navigate("/home");
      }

      return () => {
        if (dbRef.current) {
          dbRef.current.close();
        }
      };
    })();
  }, [navigate, setRoomId, toast]);

  useEffect(() => {
    const request = indexedDB.open(DB_NAME, 3);

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
      };
    };
  }, [toast]);

  return (
    <RoomContext.Provider value={{ roomId, user }}>
      {children}
    </RoomContext.Provider>
  );
};

export default RoomProvider;
