import { useCallback, useEffect, useRef, useState } from "react";
import GameBoard from "./GameBoard";
import { useRoomContext } from "@/context/RoomContext";
import { useSocket } from "@/context/SocketProvider";
import { useNavigate } from "react-router-dom";
import PlayerLeft from "./PlayerLeft";
import PlayerWin from "./PlayerWin";
import { GameData, Player, ToggleTurn, WinStatusType } from "@/types";
import { increaseHighScore as increaseHighScoreInDB } from "@/lib/action/user.action";
import { INITIAL_WIN_STATUS, WIN_PATTERNS } from "@/lib/constants";

function OnlineTic() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const counter = useRef(0);
  const [winStatus, setWinStatus] = useState<WinStatusType>(INITIAL_WIN_STATUS);
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [leftDialog, setLeftDialog] = useState<boolean>(false);
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { roomId, user, setUser } = useRoomContext();

  const resetGame = () => {
    setGameData(null);
    setBoard(Array(9).fill(null));
    counter.current = 0;
  };

  const checkIsWin = useCallback(() => {
    const isWin = WIN_PATTERNS.some((pattern) => {
      const [a, b, c] = pattern;
      const boxA = board[a];
      const boxB = board[b];
      const boxC = board[c];

      if (!boxA || !boxB || !boxC) return false;

      return boxA === boxB && boxB === boxC;
    });

    if (isWin) {
      if (gameData?.turn === user?.userId) {
        socket.emit("player_win", {
          userId: user?.userId,
          playerName: user?.userName,
        });
      }
    }

    if (counter.current === 9) {
      socket.emit("game_draw", { roomId });
    }
  }, [board, gameData?.turn, user?.userId, user?.userName, socket, roomId]);

  const handleClick = useCallback(
    ({ index }: { index: number }) => {
      if (board[index]) return;

      if (gameData?.turn !== user?.userId) {
        return;
      }

      socket.emit("player_turn", {
        roomId,
        boxId: index,
        userId: gameData?.turn,
      });
    },
    [board, gameData?.turn, roomId, socket, user?.userId],
  );

  const handleExitBtn = () => {
    socket.emit("player_left", { roomId });
    navigate("/home");
  };

  const handlePlayAgain = () => {
    socket.emit("play_again", { roomId });
  };

  const increaseHighScore = useCallback(async () => {
    if (!user) return;
    try {
      const increaseHighScore = await increaseHighScoreInDB();
      setUser(increaseHighScore);
    } catch (error) {
      console.error("Error increasing high score", error);
    }
  }, [setUser, user]);

  // * Game Start event

  useEffect(() => {
    socket.emit("start_game", { roomId });
  }, [roomId, socket]);

  // * ALL SOCKET EVENTS HERE

  useEffect(() => {
    const gameStarted = (data: GameData) => {
      console.log({ data });
      setGameData(data);
    };

    const handleGameWin = ({ winner }: { winner: string }) => {
      increaseHighScore();
      setWinStatus({
        isWin: true,
        isDraw: false,
        isLose: false,
        playerName: winner,
      });
    };

    const handleGameLose = ({ winner }: { winner: string }) => {
      setWinStatus({
        isLose: true,
        isWin: false,
        isDraw: false,
        playerName: winner,
      });
    };

    const handleGameDraw = () => {
      setWinStatus({
        isDraw: true,
        isWin: false,
        isLose: false,
        playerName: "",
      });
    };

    const handleTurn = ({ boxId, turn }: ToggleTurn) => {
      if (!gameData) return;
      const newBoard = [...board];
      newBoard[boxId] = gameData[turn];
      setBoard(newBoard);

      counter.current += 1;

      setGameData(
        (prev) =>
          ({
            ...prev,
            turn: turn,
          }) as GameData,
      );

      if (counter.current >= 5) {
        checkIsWin();
      }
    };

    const handlePlayerLeft = () => {
      setLeftDialog(true);
    };

    const handlePlayAgain = () => {
      resetGame();
      setWinStatus({
        isWin: false,
        isDraw: false,
        isLose: false,
        playerName: "",
      });
    };

    // Socket Events

    socket.on("game_started", gameStarted);
    socket.on("game_win", handleGameWin);
    socket.on("game_lose", handleGameLose);
    socket.on("game_draw", handleGameDraw);
    socket.on("player_turn", handleTurn);
    socket.on("player_left", handlePlayerLeft);
    socket.on("play_again", handlePlayAgain);

    // Clean up

    return () => {
      socket.off("game_started", gameStarted);
      socket.off("game_win", handleGameWin);
      socket.off("game_lose", handleGameLose);
      socket.off("game_draw", handleGameDraw);
      socket.off("player_turn", handleTurn);
      socket.off("player_left", handlePlayerLeft);
      socket.off("play_again", handlePlayAgain);
    };
  }, [board, checkIsWin, gameData, increaseHighScore, roomId, socket, user]);

  return (
    <>
      <GameBoard
        uiTurn={gameData ? gameData[gameData.turn] : "X"}
        handleExitBtn={handleExitBtn}
        handleClick={handleClick}
        board={board}
      />
      <PlayerLeft
        roomId={roomId}
        open={leftDialog}
        setOpenDialog={setLeftDialog}
        resetGame={resetGame}
      />
      <PlayerWin
        roomId={roomId}
        open={winStatus}
        setOpenDialog={
          setWinStatus as React.Dispatch<React.SetStateAction<WinStatusType>>
        }
        handlePlayAgain={handlePlayAgain}
      />
    </>
  );
}

export default OnlineTic;
