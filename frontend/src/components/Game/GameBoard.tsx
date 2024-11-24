import ExitGame from "@/components/Game/ExitGame";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Score from "../Score";
import MusicButton from "../MusicButton";
import { GameHeader } from "../GameHeader";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface GameBoardProps {
  OnlineGameData?: {
    opponentName: string;
    ourSymbol: "X" | "O";
  };
  currentTurn: "X" | "O";
  handleExitBtn: () => void;
  board: string[];
  handleClick: ({ index }: { index: number }) => void;
}

function GameBoard({
  OnlineGameData,
  handleExitBtn,
  board,
  handleClick,
  currentTurn,
}: GameBoardProps) {
  return (
    <div className="home_menu">
      <div className="home_menu_card">
        <div className="flex h-full w-full flex-col overflow-hidden rounded-xl">
          <div className="flex h-fit flex-col">
            <div className="flex h-fit justify-between">
              <div className="flex gap-3">
                <ExitGame handleExit={handleExitBtn}>
                  <Button variant={"roundedBtn"} size={"roundedBtn"}>
                    <img src="/icons/close-door.svg" alt="sound-on" />
                  </Button>
                </ExitGame>
                <Score />
              </div>
              <MusicButton />
            </div>
            <GameHeader
              opponentName={OnlineGameData?.opponentName || ""}
              mySymbol={OnlineGameData?.ourSymbol || "X"}
              currentTurn={currentTurn}
            />
          </div>
          <Separator className="my-2.5 bg-bg" />
          <div className="flex w-full justify-center">
            <div
              className="grid aspect-square w-full max-w-lg grid-cols-3 gap-2 bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage: "url(/images/Bar.png)",
              }}
            >
              {board.map((item, index) => (
                <div
                  key={index}
                  id={index.toString()}
                  className={`flex aspect-square cursor-pointer items-center justify-center`}
                  onClick={() => handleClick({ index })}
                >
                  {item && (
                    <div className="select-none">
                      <div
                        className={cn(
                          item ? "toggle_item_active" : "toggle_item_inactive",
                          "w-h-20 mx-2 h-20 overflow-hidden",
                        )}
                      >
                        <img
                          src={`/icons/${item}.svg`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
