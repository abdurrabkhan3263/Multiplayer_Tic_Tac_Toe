import { useToast } from "@/hooks/use-toast";
import { getRoomById } from "@/lib/action/room.action";
import { createContext, useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface RoomContextType {
  roomName: string;
  roomId: string;
}

interface RoomProviderProps {
  children: React.ReactNode;
}

export const RoomContext = createContext<RoomContextType>({
  roomId: "",
  roomName: "",
});

export const useRoomContext = () => useContext(RoomContext);

const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const [roomId, setRoomId] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
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
          setRoomName(findRoom?.data?.roomName ?? "");
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
  }, [navigate, setRoomId, setRoomName, toast]);

  return (
    <RoomContext.Provider value={{ roomId, roomName }}>
      {children}
    </RoomContext.Provider>
  );
};

export default RoomProvider;
