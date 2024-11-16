import { useToast } from "@/hooks/use-toast";
import { getRoomById } from "@/lib/action/room.action";
import { getUser } from "@/lib/action/user.action";
import { User } from "@/types";
import { createContext, useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface RoomContextType {
  user: User | undefined;
  roomId: string;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
}

interface RoomProviderProps {
  children: React.ReactNode;
}

export const RoomContext = createContext<RoomContextType>({
  user: undefined,
  roomId: "",
  setUser: () => {},
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
      if (!roomId?.startsWith("room:")) return;

      try {
        const findRoom = await getRoomById({ roomId: roomId ?? "" });

        if (findRoom?.data) {
          setRoomId(roomId ?? "");
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
    (async () => {
      try {
        const user = await getUser();
        if (user) {
          setUser(user);
        }
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

  return (
    <RoomContext.Provider value={{ roomId, user, setUser }}>
      {children}
    </RoomContext.Provider>
  );
};

export default RoomProvider;
