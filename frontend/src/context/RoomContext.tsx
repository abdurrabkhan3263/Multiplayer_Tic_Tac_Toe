import { createContext, useState, useContext, useEffect } from "react";
import { useSocket } from "./SocketProvider";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface RoomContextType {
  roomName: string;
  roomId: string;
  userId: string;
  setRoomId: React.Dispatch<React.SetStateAction<string>>;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  setRoom: React.Dispatch<React.SetStateAction<string>>;
}

interface RoomProviderProps {
  children: React.ReactNode;
}

export const RoomContext = createContext<RoomContextType>({
  roomId: "",
  userId: "",
  roomName: "",
  setRoomId: () => {},
  setUserId: () => {},
  setRoom: () => {},
});
export const useRoomContext = () => useContext(RoomContext);

const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const [roomId, setRoomId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [roomName, setRoom] = useState<string>("");
  const socket = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (socket && roomId && userId) {
      socket.emit("rejoin_into_room", {
        roomName,
        userId,
        roomId,
      });

      socket.on("game_error", (error: string) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      });
    }

    socket.on("player_left", () => {
      toast({
        title: "Error",
        description: "Player left the game",
        variant: "destructive",
      });
      navigate("/home");
    });

    return () => {
      socket.off("player_left");
      socket.off("game_error");
    };
  }, []);

  return (
    <RoomContext.Provider
      value={{ roomId, userId, roomName, setRoomId, setUserId, setRoom }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export default RoomProvider;
