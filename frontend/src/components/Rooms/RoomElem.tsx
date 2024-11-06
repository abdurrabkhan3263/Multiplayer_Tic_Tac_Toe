import React from "react";
import { LockKeyhole, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import RoomForm from "./RoomForm";
import { useToast } from "@/hooks/use-toast";

interface RoomElemProps {
  name: string;
  password: string;
  description?: string;
  participants?: number;
}

function RoomElem({
  name,
  password,
  description = "Private Room",
  participants = 0,
}: RoomElemProps) {
  const [isEntering, setIsEntering] = React.useState<boolean>(false);
  const [roomName, setRoomName] = React.useState<string>(name);
  const { toast } = useToast();

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

      await new Promise((resolve) => setTimeout(resolve, 1000));
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
                <p className="text-sm text-purple-100">{description}</p>
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
      </DialogContent>
    </Dialog>
  );
}

export default RoomElem;
