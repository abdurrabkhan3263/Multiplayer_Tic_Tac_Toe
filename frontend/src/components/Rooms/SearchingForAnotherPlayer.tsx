import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSocket } from "@/context/SocketProvider";

interface SearchingForAnotherPlayerProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  roomId: string;
}

function SearchingForAnotherPlayer({
  roomId,
  dialogOpen,
  setDialogOpen,
}: SearchingForAnotherPlayerProps) {
  const { socket } = useSocket();

  const handleDialogOpen = () => {
    setDialogOpen((prev) => !prev);
    if (dialogOpen && roomId) {
      socket.emit("player_left", roomId);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
      <DialogContent className="text-white sm:max-w-[425px]">
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold">Searching for another player...</h2>
          <div className="animate-spin">
            <img
              src="/icons/timer-loader.svg"
              alt="Searching for another player"
              className="mx-auto h-24 w-24"
            />
          </div>
          <p className="text-center text-lg">
            Please wait while we find another player to play with you.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SearchingForAnotherPlayer;
