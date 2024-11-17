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
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
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

  const checkIsWin = useCallback(async () => {
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
      if (!board[a] || !board[b] || !board[c]) return false;

      if (board[a] === board[b] && board[b] === board[c]) {
        return true;
      }
    });

    if (isWin) {
      setBoard(Array(9).fill(""));
      setWinStatus({
        isWin: true,
        isDraw: false,
        isLose: false,
      });
    }
  }, [board]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.currentTarget as HTMLElement;
      const clickedIndex = parseInt(target.id);

      if (target.firstChild) return;

      setBoard((prevBoard) => [
        ...prevBoard.slice(0, clickedIndex),
        turn,
        ...prevBoard.slice(clickedIndex + 1),
      ]);

      counter.current += 1;

      if (counter.current >= 5) {
        checkIsWin();
      }
      if (counter.current === 9) {
        setBoard(Array(9).fill(""));
        setWinStatus({
          isDraw: true,
          isWin: false,
          isLose: false,
        });
      }

      toggleTurn();
    },
    [checkIsWin, toggleTurn, turn],
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
      <GameBoard uiTurn={turn} handleExitBtn={handleExit} board={board} />
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
