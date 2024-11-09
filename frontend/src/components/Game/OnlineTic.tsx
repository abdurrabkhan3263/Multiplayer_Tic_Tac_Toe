import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import GameBoard from "./GameBoard";
import { io, Socket } from "socket.io-client";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Loader2 } from "lucide-react";
import RoomProvider from "@/context/RoomContext";

function OnlineTic() {
  const turnArr = ["X", "O"];
  const turn = useRef<"X" | "O">(
    turnArr[Math.floor(Math.random() * 2)] as "X" | "O",
  );
  const [uiTurn, setUiTurn] = useState<"X" | "O">(turn.current);
  const counter = useRef(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [winStatus, setWinStatus] = useState({
    isWin: false,
    player: "",
  });
  const socket = io("/game");
  const [winDialog, setWinDialog] = useState(false);
  const [isUsersConnected, setIsUsersConnected] = useState(false);

  const toggleTurn = () => {
    turn.current = turn.current === "X" ? "O" : "X";
    setUiTurn(turn.current);
  };

  const resetGame = () => {
    const boxes = document.querySelectorAll(".tic_tac_box");
    const boxArray = Array.from(boxes);

    boxArray.forEach((box) => {
      box.innerHTML = "";
    });

    counter.current = 0;
  };

  const checkIsWin = () => {
    const boxes = document.querySelectorAll(".tic_tac_box");
    const boxArray = Array.from(boxes);

    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    const isWin = winPatterns.some((pattern) => {
      const [a, b, c] = pattern;
      const boxA = boxArray[a]?.firstElementChild?.id;
      const boxB = boxArray[b]?.firstElementChild?.id;
      const boxC = boxArray[c]?.firstElementChild?.id;

      if (!boxA || !boxB || !boxC) return false;

      return boxA === boxB && boxB === boxC;
    });

    if (isWin) {
      setWinStatus({
        isWin: true,
        player: turn.current,
      });
      setOpenDialog(true);
    }
  };

  const AddDivElement = () => {
    return `<div id="${turn.current}" class="toggle_item_inactive select-none">
    <div class=${cn("w-h-20 mx-2 h-20 overflow-hidden")}>
      <img src="/${turn.current}.png" class="h-full w-full object-cover"/>
    </div>`;
  };

  const handleTurn = (target: HTMLElement) => {
    target.innerHTML = AddDivElement();
    target.firstElementChild?.classList.replace(
      "toggle_item_inactive",
      "toggle_item_active",
    );
    counter.current += 1;

    if (counter.current >= 3) {
      checkIsWin();
    }
    if (counter.current === 9) {
      setOpenDialog(true);
    }

    toggleTurn();
  };

  const handleClick = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;

    if (target.firstChild) return;

    handleTurn(target);
  };

  useEffect(() => {
    const boxes = document.querySelectorAll(".tic_tac_box");

    if (!boxes) return;

    boxes.forEach((box) => {
      (box as HTMLElement).addEventListener("click", handleClick);
    });

    // Emitting for rejoining the game
    socket.emit("join_game");

    return () => {
      boxes.forEach((box) => {
        (box as HTMLElement).removeEventListener("click", handleClick);
      });
    };
  }, []);

  return (
    <>
      <RoomProvider>
        {!isUsersConnected && (
          <div className="fixed right-1/2 top-1/2 h-screen w-screen translate-x-1/2 translate-y-1/2 bg-gray-700/15">
            {
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold">Waiting for player</h1>
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
            }
          </div>
        )}
        <GameBoard
          counter={counter}
          openDialog={openDialog}
          resetGame={resetGame}
          winStatus={winStatus}
          uiTurn={uiTurn}
          setOpenDialog={setOpenDialog}
        />
        <Dialog>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Player Left the Game You Win</DialogTitle>
              <DialogDescription>
                Player left the game. You win the game.
              </DialogDescription>
            </DialogHeader>
            <div>
              <button
                onClick={() => {
                  setWinDialog(false);
                  resetGame();
                }}
                className="bg-primary w-full rounded-md py-2 text-white"
              >
                Home
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </RoomProvider>
    </>
  );
}

export default OnlineTic;
