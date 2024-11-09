import React, { useEffect } from "react";
import { LockKeyhole, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import RoomForm from "./RoomForm";
import { useToast } from "@/hooks/use-toast";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useRoomContext } from "@/context/RoomContext";

interface RoomElemProps {
  name: string;
  password: string;
  type: "private" | "public";
  participants: number;
  userId: string;
  roomId: string;
}

function RoomElem({
  name,
  password,
  type,
  participants = 0,
  userId,
  roomId,
}: RoomElemProps) {
  const [isEntering, setIsEntering] = React.useState<boolean>(false);
  const [roomName, setRoomName] = React.useState<string>(name);
  const { toast } = useToast();
  const socket = io("/game");
  const [searchingToAnotherUser, setSearchingToAnotherUser] =
    React.useState(false);
  const navigate = useNavigate();
  const { setUserId, setRoomId, setRoom } = useRoomContext();

  const handleEnterRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const enteredPassword = formData.get("password") as string;

    if (!enteredPassword) {
      toast({
        title: "Error",
        description: "Password is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEntering(true);

      if (enteredPassword !== password) {
        throw new Error("Invalid password");
      }

      socket.emit("join_into_custom_room", {
        roomName: name,
        userId,
        password: enteredPassword,
        roomId,
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

  useEffect(() => {
    socket.on("match_found", (data: { roomName: string }) => {
      toast({
        title: "Match Found",
        description: `You are matched with another player in ${data.roomName}`,
      });
      navigate(`/home/play/${data.roomName}`);
    });

    socket.on("game_error", (error: string) => {
      setSearchingToAnotherUser(false);
      console.log("Error", error);
      toast({
        title: "Server Error",
        description: error,
        variant: "destructive",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    setUserId(userId);
    setRoomId(roomId);
    setRoom(name);
  }, [userId, roomId, name]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group w-full cursor-pointer select-none">
          <div className="flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <LockKeyhole className="h-4 w-4 text-purple-500" />
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-balance text-sm font-bold text-white">
                  {name}
                </h3>
                <p className="text-sm text-purple-100">
                  {type === "public" ? "Private Room" : "Public Room"}
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
          btnText="Enter Room"
          header="Enter to the custom room"
        />
        {searchingToAnotherUser && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-sm text-white">
              Searching for another player...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default RoomElem;
