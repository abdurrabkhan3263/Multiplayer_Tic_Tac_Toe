import { User } from "@/types";
import { createContext, useState, useContext } from "react";

interface RoomContextType {
  roomName: string;
  roomId: string;
  user: User | null;
  setRoomId: React.Dispatch<React.SetStateAction<string>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setRoomName: React.Dispatch<React.SetStateAction<string>>;
}

interface RoomProviderProps {
  children: React.ReactNode;
}

export const RoomContext = createContext<RoomContextType>({
  roomId: "",
  user: null,
  roomName: "",
  setRoomId: () => {},
  setUser: () => {},
  setRoomName: () => {},
});

export const useRoomContext = () => useContext(RoomContext);

const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const [roomId, setRoomId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  // const socket = useSocket();
  // const { toast } = useToast();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (socket && roomId && userId) {
  //     socket.emit("rejoin_into_room", {
  //       roomName,
  //       userId,
  //       roomId,
  //     });
  //   }

  //   const handlePlayerLeft = () => {
  //     toast({
  //       title: "Error",
  //       description: "Player left the game",
  //       variant: "destructive",
  //     });
  //     navigate("/home");
  //   };

  //   socket.on("player_left", handlePlayerLeft);

  //   return () => {

  //     socket.off("player_left", handlePlayerLeft);
  //   };
  // }, [navigate, roomId, roomName, socket, toast, userId]);

  return (
    <RoomContext.Provider
      value={{ roomId, user, roomName, setRoomId, setUser, setRoomName }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export default RoomProvider;
