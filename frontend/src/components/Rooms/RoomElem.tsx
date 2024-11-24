import React, { useEffect } from "react";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import RoomForm from "./RoomForm";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GameError, User } from "@/types";
import SearchingForAnotherPlayer from "./SearchingForAnotherPlayer";
import { ENTER_BTN_ROOM_TEXT, ENTER_HEADER_TEXT } from "@/lib/constants";
import { io } from "socket.io-client";
import { useSocket } from "@/context/SocketProvider";

interface RoomElemProps {
  name: string;
  password?: string;
  type: "private" | "public";
  participants: string;
  user: User;
  roomId: string;
}

function RoomElem({
  name,
  password,
  type,
  participants = "0",
  user,
  roomId,
}: RoomElemProps) {
  const [isEntering, setIsEntering] = React.useState<boolean>(false);
  const [roomName, setRoomName] = React.useState<string>(name);
  const { toast } = useToast();
  const { socket } = useSocket();
  const [searchingToAnotherUser, setSearchingToAnotherUser] =
    React.useState<boolean>(false);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleEnterRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const enteredPassword = formData.get("password") as string;

    if (password) {
      if (!enteredPassword) {
        toast({
          title: "Error",
          description: "Password is required",
          variant: "destructive",
        });
        return;
      }

      if (enteredPassword !== password) {
        throw new Error("Invalid password");
      }
    }

    try {
      setIsEntering(true);

      socket.emit("join_into_custom_room", {
        roomName: name,
        user,
        password: enteredPassword,
        id: roomId,
      });

      setSearchingToAnotherUser(true);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while entering the room",
        variant: "destructive",
      });
    } finally {
      setIsEntering(false);
    }
  };

  // Listener functions

  const handleGameError = React.useCallback(
    (error: GameError) => {
      setSearchingToAnotherUser(false);
      toast({
        title: "Game Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
    [toast],
  );

  const handleMatchFound = React.useCallback(
    ({ roomId }: { roomId: string }) => {
      navigate(`/play/${roomId}`);
    },
    [navigate],
  );

  useEffect(() => {
    socket.on("game_error", handleGameError);
    socket.on("match_found", handleMatchFound);
  }, [handleGameError, handleMatchFound, socket]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div className="group w-full cursor-pointer select-none">
          <div className="flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <img src={`/icons/${type}.svg`} alt="room" className="h-6" />
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-balance text-sm font-bold text-white">
                  {name}
                </h3>
                <p className="text-xs text-purple-100">
                  {type === "public" ? "Public Room" : "Private Room"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-white/20 text-white hover:bg-white/30">
                <Users className="mr-1 h-3 w-3" />
                {participants}
              </Badge>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <RoomForm
          roomName={roomName}
          handleRoomSubmit={handleEnterRoom}
          setRoomName={setRoomName}
          onSubmit={isEntering}
          btnText={ENTER_BTN_ROOM_TEXT}
          header={ENTER_HEADER_TEXT}
          roomPassword={password}
        />
        <SearchingForAnotherPlayer
          dialogOpen={searchingToAnotherUser}
          setDialogOpen={setSearchingToAnotherUser}
          roomId={`room:${roomId}`}
        />
      </DialogContent>
    </Dialog>
  );
}

export default RoomElem;
