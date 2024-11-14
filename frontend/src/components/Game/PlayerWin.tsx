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
import { WinStatusType } from "@/types";

interface PlayerWinProps {
  roomId: string;
  open: WinStatusType;
  setOpenDialog: React.Dispatch<React.SetStateAction<WinStatusType>>;
}

function PlayerWin({ roomId, open, setOpenDialog }: PlayerWinProps) {
  const { socket } = useSocket();
  const navigate = useNavigate();

  const handleGoToHome = () => {
    navigate("/home");
    setOpenDialog({});
    socket.emit("player_left", { roomId });
  };

  const handlePlayAgain = () => {
    setOpenDialog({});
  };

  return (
    <Dialog
      open={open.isWin || open.isDraw}
      onOpenChange={() => {
        if (open.isWin || open.isDraw) {
          setOpenDialog({
            isWin: open?.isWin ?? undefined,
            isDraw: open?.isDraw ?? undefined,
          } as WinStatusType);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {open.isWin ? "We have a Winner! 🎉" : "Game Over!"}
          </DialogTitle>
          <DialogDescription>
            {open.isWin
              ? `Congratulations to Player ${open.player} for winning the game!`
              : "The game ended in a draw. Well played!"}
          </DialogDescription>
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
