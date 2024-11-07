import React from "react";
import ExitGame from "@/components/Game/ExitGame";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LogOut, RefreshCcw, Volume2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WinStatusType } from "@/types";

interface GameBoardProps {
  uiTurn: string;
  counter: React.MutableRefObject<number>;
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  winStatus: WinStatusType;
  resetGame: () => void;
}

function GameBoard({
  uiTurn,
  counter,
  openDialog,
  setOpenDialog,
  winStatus,
  resetGame,
}: GameBoardProps) {
  return (
    <main className="home_page">
      <div className="home_menu">
        <div className="home_menu_card">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-[#EEEEEE] p-2">
            <div className="flex h-fit flex-col">
              <div className="flex h-fit justify-between">
                <ExitGame>
                  <Button variant={"coolBtn"}>
                    <LogOut size={24} />
                  </Button>
                </ExitGame>
                <Button variant={"coolBtn"}>
                  <Volume2 size={24} />
                </Button>
              </div>

              <div className="my-2.5 w-full">
                <div className="relative flex items-center justify-center">
                  <div
                    className={`absolute -top-2.5 h-3 w-3 rounded-full bg-blue-500 transition-all`}
                    style={
                      uiTurn === "X"
                        ? { left: "12.75rem" }
                        : { right: "12.75rem" }
                    }
                  ></div>
                  <div className={cn("mx-2 h-12 w-12 overflow-hidden")}>
                    <img src="/x.png" className="h-full w-full object-cover" />
                  </div>
                  <span className="mx-2 h-14 w-14 overflow-hidden">
                    <img
                      src="/vs.png"
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <div className={cn("mx-2 h-12 w-12 overflow-hidden")}>
                    <img src="/o.png" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-2.5 bg-bg" />
            <div
              className="mt-2 grid flex-1 grid-cols-3 grid-rows-3 gap-2 bg-cover bg-center bg-no-repeat md:h-full md:w-full"
              style={{ backgroundImage: "url(/Bar.png)" }}
            >
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="tic_tac_box flex items-center justify-center"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={openDialog}
        onOpenChange={() => {
          if (counter.current === 9 || winStatus.isWin) return;
          setOpenDialog(false);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {counter.current === 9
                ? "Draw"
                : winStatus.isWin
                  ? `${winStatus.player} in Win`
                  : "Game Over"}
            </DialogTitle>
            <DialogDescription>
              The game is over, do you want to play again?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between">
            <Button variant={"leaveBtn"}>
              <ExitGame>
                <>
                  Exit <LogOut size={24} />
                </>
              </ExitGame>
            </Button>
            <Button
              variant={"coolBtn"}
              onClick={() => {
                setOpenDialog(false);
                resetGame();
              }}
            >
              Play Again
              <RefreshCcw />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default GameBoard;
