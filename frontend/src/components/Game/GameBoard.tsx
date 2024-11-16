import ExitGame from "@/components/Game/ExitGame";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LogOut, Volume2 } from "lucide-react";
import Score from "../Score";
import MusicButton from "../MusicButton";

interface GameBoardProps {
  uiTurn: string;
  handleExitBtn: () => void;
}

function GameBoard({ uiTurn, handleExitBtn }: GameBoardProps) {
  return (
    <main className="home_page">
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

              <div className="my-2.5 w-full">
                <div className="relative flex items-center justify-center">
                  <div
                    className={`bg-blue-500 absolute -top-2.5 h-3 w-3 rounded-full transition-all`}
                    style={
                      uiTurn === "X"
                        ? { left: "12.75rem" }
                        : { right: "12.75rem" }
                    }
                  ></div>
                  <div className={cn("mx-2 h-12 w-12 overflow-hidden")}>
                    <img src="/sx.png" className="h-full w-full object-cover" />
                  </div>
                  <span className="mx-2 h-14 w-14 overflow-hidden">
                    <img
                      src="/vs.png"
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <div className={cn("mx-2 h-12 w-12 overflow-hidden")}>
                    <img src="/so.png" className="h-full w-full object-cover" />
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
    </main>
  );
}

export default GameBoard;
