import GameBoard from "./GameBoard";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayerWin from "./PlayerWin";
import { WinStatusType } from "@/types";

function OfflineTic() {
  const turnArr = ["X", "O"];
  const [turn, setTurn] = useState<"X" | "O">(
    turnArr[Math.floor(Math.random() * 2)] as "X" | "O",
  );
  const [winStatus, setWinStatus] = useState<WinStatusType>({
    isWin: false,
    isDraw: false,
    isLose: false,
  });
  const counter = useRef(0);
  const navigate = useNavigate();

  const toggleTurn = useCallback(() => {
    setTurn((prevTurn) => (prevTurn === "X" ? "O" : "X"));
  }, []);

  const resetGame = () => {
    const boxes = document.querySelectorAll(".tic_tac_box");
    const boxArray = Array.from(boxes);

    boxArray.forEach((box) => {
      box.innerHTML = "";
    });

    counter.current = 0;
  };

  const checkIsWin = async () => {
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
        isDraw: false,
        isLose: false,
      });
    }
  };

  const AddDivElement = useCallback(() => {
    return `<div id="${turn}" class="toggle_item_inactive select-none">
    <div class="w-h-20 mx-2 h-20 overflow-hidden}">
      <img src="/${turn}.png" class="h-full w-full object-cover"/>
    </div>`;
  }, [turn]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.currentTarget as HTMLElement;

      if (target.firstChild) return;

      target.innerHTML = AddDivElement();
      target.firstElementChild?.classList.replace(
        "toggle_item_inactive",
        "toggle_item_active",
      );
      counter.current += 1;

      if (counter.current >= 5) {
        checkIsWin();
      }
      if (counter.current === 9) {
        setWinStatus({
          isDraw: true,
          isWin: false,
          isLose: false,
        });
      }

      toggleTurn();
    },
    [AddDivElement, toggleTurn],
  );

  const handleExit = () => {
    resetGame();
    setWinStatus({
      isDraw: false,
      isWin: false,
      isLose: false,
    });
    navigate("/home");
  };

  const handlePlayAgain = () => {
    resetGame();
    setWinStatus({
      isDraw: false,
      isWin: false,
      isLose: false,
    });
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
  }, [handleClick]);

  return (
    <>
      <GameBoard uiTurn={turn} handleExitBtn={handleExit} />
      <PlayerWin
        open={winStatus}
        setOpenDialog={
          setWinStatus as React.Dispatch<React.SetStateAction<WinStatusType>>
        }
        handlePlayAgain={handlePlayAgain}
      />
    </>
  );
}

export default OfflineTic;
