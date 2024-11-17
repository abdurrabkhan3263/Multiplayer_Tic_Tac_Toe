import React, { useEffect } from "react";
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
import { PlayerWinMessage, WinStatusType } from "@/types";

interface PlayerWinProps {
  roomId?: string;
  open: WinStatusType;
  setOpenDialog: React.Dispatch<React.SetStateAction<WinStatusType>>;
  handlePlayAgain: () => void;
}

function PlayerWin({
  roomId,
  open,
  setOpenDialog,
  handlePlayAgain,
}: PlayerWinProps) {
  const [message, setMessage] = React.useState<PlayerWinMessage>();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const handleGoToHome = () => {
    navigate("/home");
    setOpenDialog({
      isWin: false,
      isDraw: false,
      isLose: false,
      playerName: "",
    });

    if (!roomId) return;

    socket.emit("player_left", { roomId });
  };

  useEffect(() => {
    if (open.isWin) {
      setMessage({
        title: "We have a Winner! 🎉",
        description: `Congratulations to Player ${open.playerName} for winning the game!`,
      });
    } else if (open.isDraw) {
      setMessage({
        title: "Game Over! 🎮",
        description: "The game ended in a draw. Well played!",
      });
    } else if (open.isLose) {
      setMessage({
        title: "You Lose! 😢",
        description: `${open.playerName} won the game! Better luck next time.`,
      });
    } else {
      setMessage({
        title: "Game Over!",
        description: "The game ended in a draw. Well played!",
      });
    }
  }, [open, setOpenDialog]);

  return (
    <Dialog
      open={open.isWin || open.isDraw || open.isLose}
      onOpenChange={() => {
        if (open.isWin || open.isDraw || open.isLose) {
          setOpenDialog((prev) => ({
            ...prev,
            isWin: open?.isWin ?? false,
            isDraw: open?.isDraw ?? false,
            isLose: open?.isLose ?? false,
          }));
        }
      }}
    >
      <DialogContent className="text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{message?.title}</DialogTitle>
          <DialogDescription className="text-white">
            {message?.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between">
          <Button variant={"gameBtn"} onClick={handlePlayAgain}>
            Play Again
            <img
              src="/icons/play-again.svg"
              alt="refresh"
              className="h-w-6 w-6"
            />
          </Button>
          <Button variant={"gameBtn"} onClick={handleGoToHome}>
            Home
            <img src="/icons/home-menu.svg" alt="home" className="h-w-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PlayerWin;
