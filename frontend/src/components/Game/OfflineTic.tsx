import GameBoard from "./GameBoard";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayerWin from "./PlayerWin";
import { Player, WinStatusType } from "@/types";
import { INITIAL_WIN_STATUS, WIN_PATTERNS } from "@/lib/constants";
import { useSocket } from "@/context/SocketProvider";

function OfflineTic() {
  const turnArr = ["X", "O"];
  const [turn, setTurn] = useState<"X" | "O">(
    turnArr[Math.floor(Math.random() * 2)] as "X" | "O",
  );
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [winStatus, setWinStatus] = useState<WinStatusType>(INITIAL_WIN_STATUS);
  const counter = useRef(0);
  const navigate = useNavigate();
  const { music } = useSocket();
  const moveAudioRef = useRef(new Audio("/audio/move.mp3"));
  const winAudioRef = useRef(new Audio("/audio/win.mp3"));

  const toggleTurn = useCallback(() => {
    setTurn((prevTurn) => (prevTurn === "X" ? "O" : "X"));
  }, [setTurn]);

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    counter.current = 0;
  };

  const checkIsWin = useCallback(
    (currentBoard: Player[], currentPlayer: Player) => {
      const isWin = WIN_PATTERNS.some((pattern) => {
        const [a, b, c] = pattern;

        if (!currentBoard[a] || !currentBoard[b] || !currentBoard[c])
          return false;

        if (
          currentBoard[a] === currentBoard[b] &&
          currentBoard[b] === currentBoard[c]
        ) {
          return true;
        }
      });

      if (isWin) {
        resetGame();
        if (music) {
          winAudioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error);
          });
        }
        setWinStatus({
          isWin: true,
          isDraw: false,
          isLose: false,
          playerName: currentPlayer,
        });
      }
    },
    [music],
  );

  const handleClick = useCallback(
    ({ index }: { index: number }) => {
      if (board[index]) return;

      if (music) {
        moveAudioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      }

      const newBoard = [...board];
      newBoard[index] = turn;
      setBoard(newBoard);

      counter.current += 1;

      if (counter.current === 9) {
        resetGame();
        setWinStatus({
          isDraw: true,
          isWin: false,
          isLose: false,
        });
      }
      if (counter.current >= 5) {
        checkIsWin(newBoard, turn);
      }

      toggleTurn();
    },
    [board, music, turn, toggleTurn, checkIsWin],
  );

  const handleExit = () => {
    resetGame();
    setWinStatus({
      isDraw: false,
      isWin: false,
      isLose: false,
    });
    navigate("/");
  };

  const handlePlayAgain = () => {
    resetGame();
    setWinStatus({
      isDraw: false,
      isWin: false,
      isLose: false,
    });
  };

  return (
    <>
      <GameBoard
        handleExitBtn={handleExit}
        board={board}
        handleClick={handleClick}
        currentTurn={turn}
      />
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
