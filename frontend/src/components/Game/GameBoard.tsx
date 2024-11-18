import ExitGame from "@/components/Game/ExitGame";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Score from "../Score";
import MusicButton from "../MusicButton";

interface GameBoardProps {
  uiTurn: string;
  handleExitBtn: () => void;
  board: string[];
  handleClick: ({ index }: { index: number }) => void;
}

function GameBoard({
  uiTurn,
  handleExitBtn,
  board,
  handleClick,
}: GameBoardProps) {
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
                    className={`absolute -top-2.5 h-3 w-3 rounded-full bg-blue-500 transition-all`}
                    style={
                      uiTurn === "X"
                        ? { left: "12.75rem" }
                        : { right: "12.75rem" }
                    }
                  ></div>
                  <div className={cn("mx-2 h-12 w-12 overflow-hidden")}>
                    <img
                      src="/icons/smX.svg"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="mx-2 h-11 w-11 overflow-hidden">
                    <img
                      src="/icons/vs.svg"
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <div className={cn("mx-2 h-12 w-12 overflow-hidden")}>
                    <img
                      src="/icons/smO.svg"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-2.5 bg-bg" />
            <div className="flex w-full justify-center">
              <div
                className="grid aspect-square w-full max-w-lg grid-cols-3 gap-2 bg-contain bg-center bg-no-repeat"
                style={{
                  backgroundImage: "url(/images/bar.png)",
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
                        <div className="w-h-20 mx-2 h-20 overflow-hidden">
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
    </main>
  );
}

export default GameBoard;
