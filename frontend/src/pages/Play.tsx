import ExitGame from "@/components/Game/ExitGame";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, Volume2 } from "lucide-react";
import { useEffect, useRef } from "react";

function Play() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const turn = useRef<"X" | "O">("X");

  const toggleTurn = () => {
    turn.current = turn.current === "X" ? "O" : "X";
  };

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const X = target.querySelector("#tic_X");
    const O = target.querySelector("#tic_O");

    toggleTurn();

    if (turn.current === "X") {
      X?.classList.replace("toggle_item_inactive", "toggle_item_active");
    } else {
      O?.classList.replace("toggle_item_inactive", "toggle_item_active");
    }
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
                <div className="flex items-center justify-center">
                  <div className={cn("mx-2 h-12 w-12 overflow-hidden")}>
                    <img src="/X.png" className="h-full w-full object-cover" />
                  </div>
                  <span className="mx-2 h-14 w-14 overflow-hidden">
                    <img
                      src="/vs.png"
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <div className={cn("mx-2 h-12 w-12 overflow-hidden")}>
                    <img src="/O.png" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 grid flex-1 grid-cols-3 grid-rows-3 gap-2">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="tic_tac_box flex items-center justify-center bg-blue-500 hover:bg-blue-300"
                >
                  <div id="tic_X" className="toggle_item_inactive">
                    <div className={cn("w-h-20 mx-2 h-20 overflow-hidden")}>
                      <img
                        src="/X.png"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div id="tic_O" className="toggle_item_inactive">
                    <div className={cn("w-h-20 mx-2 h-20 overflow-hidden")}>
                      <img
                        src="/O.png"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Play;
