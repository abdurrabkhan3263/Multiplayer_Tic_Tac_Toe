import ExitGame from "@/components/Game/ExitGame";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LogOut, RefreshCcw, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Play() {
  const turnArr = ["X", "O"];
  const params = useParams();
  const turn = useRef<"X" | "O">(
    turnArr[Math.floor(Math.random() * 2)] as "X" | "O",
  );
  const [uiTurn, setUiTurn] = useState<"X" | "O">(turn.current);
  const counter = useRef(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [isWin, setIsWin] = useState(false);

  const toggleTurn = () => {
    turn.current = turn.current === "X" ? "O" : "X";
    setUiTurn(turn.current);

    if (params.roomId) {
      //TODO: Send turn to the server
    }
  };

  const resetGame = () => {
    const boxes = document.querySelectorAll(".tic_tac_box");
    const boxArray = Array.from(boxes);

    boxArray.forEach((box) => {
      box.innerHTML = "";
    });

    counter.current = 0;

    if (params.roomId) {
      // TODO: Send reset to the server
    }
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
      alert(`${turn.current} wins!`);
      resetGame();

      if (params.roomId) {
        // TODO: Send win to the server
      }
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
    const ClickedIndex = Array.prototype.indexOf.call(
      target.parentNode?.children,
      target,
    );
    if (target.firstChild) return;

    handleTurn(target);
  };

  useEffect(() => {
    const boxes = document.querySelectorAll(".tic_tac_box");

    if (!boxes) return;

    boxes.forEach((box) => {
      (box as HTMLElement).addEventListener("click", handleClick);
    });

    return () => {
      boxes.forEach((box) => {
        (box as HTMLElement).removeEventListener("click", handleClick);
      });
    };
  }, []);

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
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {counter.current === 9 ? "Draw" : isWin ? "Win" : "Game Over"}
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

export default Play;
