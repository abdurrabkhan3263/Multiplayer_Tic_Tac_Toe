import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { House, Repeat2 } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";

interface PlayerWinProps {
  roomId: string;
  open: {
    isWin: boolean;
    player: string;
  };
  setOpenDialog: React.Dispatch<
    React.SetStateAction<{
      isWin: boolean;
      player: string;
    }>
  >;
}

function PlayerWin({ roomId, open, setOpenDialog }: PlayerWinProps) {
  const socket = useSocket();
  const navigate = useNavigate();

  const handleGoToHome = () => {
    navigate("/home");
    setOpenDialog({ isWin: false, player: "" });
    socket.emit("player_left", { roomId });
  };

  const handlePlayAgain = () => {
    setOpenDialog({ isWin: false, player: "" });
  };

  return (
    <Dialog
      open={open.isWin}
      onOpenChange={() => {
        if (open.isWin) {
          setOpenDialog({ isWin: true, player: "" });
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Congratulation 🎉</DialogTitle>
          <DialogDescription>{open.player} win the game.</DialogDescription>
        </DialogHeader>
        <div className="flex justify-between">
          <Button variant={"gameBtn"} onClick={handlePlayAgain}>
            Play Again <Repeat2 />
          </Button>
          <Button variant={"gameBtn"} onClick={handleGoToHome}>
            Home <House />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PlayerWin;
