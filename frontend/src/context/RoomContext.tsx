import { useToast } from "@/hooks/use-toast";
import { getRoomById } from "@/lib/action/room.action";
import { createContext, useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface RoomContextType {
  roomId: string;
}

interface RoomProviderProps {
  children: React.ReactNode;
}

export const RoomContext = createContext<RoomContextType>({
  roomId: "",
});

export const useRoomContext = () => useContext(RoomContext);

const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const [roomId, setRoomId] = useState<string>("");
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
          navigate("/");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: (error as Error)?.message ?? "Something went wrong",
          variant: "destructive",
        });
        navigate("/");
      }

      return () => {
        if (dbRef.current) {
          dbRef.current.close();
        }
      };
    })();
  }, [navigate, setRoomId, toast]);

  return (
    <RoomContext.Provider value={{ roomId }}>{children}</RoomContext.Provider>
  );
};

export default RoomProvider;
