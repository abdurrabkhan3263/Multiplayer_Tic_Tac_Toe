import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "../ui/button";
import { useSocket } from "@/context/SocketProvider";

interface PlayerLeftProps {
  roomId: string;
  open: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  resetGame: () => void;
}

function PlayerLeft({
  roomId,
  open,
  setOpenDialog,
  resetGame,
}: PlayerLeftProps) {
  const { socket } = useSocket();
  const navigate = useNavigate();

  const handleGoToHome = () => {
    navigate("/");
    setOpenDialog(false);
    resetGame();
    socket.emit("player_left", roomId);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        if (!open) {
          setOpenDialog(true);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Oops! Player Left</DialogTitle>
          <DialogDescription>
            The other player has left the game.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button variant={"gameBtn"} onClick={handleGoToHome}>
            Go Home
            <img src="/icons/home-menu.svg" alt="Home" className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PlayerLeft;
