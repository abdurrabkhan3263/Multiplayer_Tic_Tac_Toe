import { useCallback, useEffect, useState } from "react";
import GameBoard from "./GameBoard";
import { useRoomContext } from "@/context/RoomContext";
import { useSocket } from "@/context/SocketProvider";
import { useNavigate } from "react-router-dom";
import PlayerLeft from "./PlayerLeft";
import PlayerWin from "./PlayerWin";
import { GameState, RoomResult, WinStatusType } from "@/types";
import { INITIAL_WIN_STATUS } from "@/lib/constants";
import { increaseHighScore as increaseHighScoreInDB } from "@/lib/action/user.action";

function OnlineTic() {
  const [turn, setTurn] = useState<string>("");
  const [gameData, setGameData] = useState<GameState>();
  const [winStatus, setWinStatus] = useState<WinStatusType>(INITIAL_WIN_STATUS);
  const [leftDialog, setLeftDialog] = useState<boolean>(false);
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user, setUser, music } = useSocket();
  const { roomId } = useRoomContext();

  const handleClick = useCallback(
    ({ index }: { index: number }) => {
      if (gameData?.board[index] && gameData?.currentTurn !== user?.userId)
        return;

      socket.emit("player_move", {
        boxId: index,
        roomId,
      });
    },
    [gameData?.board, gameData?.currentTurn, roomId, socket, user?.userId],
  );

  const handleExit = () => {
    socket.emit("player_left", roomId);
    navigate("/");
  };

  const handlePlayAgain = () => {
    socket.emit("play_again", roomId);
  };

  const handleResetGame = () => {
    setLeftDialog(false);
    setWinStatus(INITIAL_WIN_STATUS);
  };

  const increaseHighScore = useCallback(async () => {
    if (!user) return;
    try {
      const increaseHighScore = await increaseHighScoreInDB();
      setUser(increaseHighScore);
    } catch (error) {
      console.error("Error increasing high score", error);
    }
  }, [user, setUser]);

  // * Game Start event

  useEffect(() => {
    socket.emit("rejoin_room", { roomId, userId: user?.userId });
  }, [roomId, socket, user]);

  // * ALL SOCKET EVENTS HERE

  useEffect(() => {
    const handleGameStart = (data: GameState) => {
      setGameData(data);

      const currentSymbol =
        data.player1?.userId === data.currentTurn
          ? data.player1?.symbol
          : data.player2?.symbol;

      setTurn(currentSymbol as string);
    };

    const handleMove = (gameState: GameState) => {
      if (!gameData) return;

      const symbol =
        gameData.player1?.userId === gameState?.currentTurn
          ? gameData.player1?.symbol
          : gameData.player2?.symbol;

      setTurn(symbol as string);
      setGameData(gameState);
    };

    const handlePlayerLeft = () => {
      setLeftDialog(true);
    };

    const handlePlayAgain = (gameState: GameState) => {
      setWinStatus({
        isWin: false,
        isDraw: false,
        isLose: false,
        playerName: "",
      });
      setGameData(gameState);
      setTurn(gameData?.player1?.userId === gameState?.currentTurn ? "X" : "O");
    };

    const handleGameStatus = async (RoomResult: RoomResult) => {
      if (RoomResult?.userId === user?.userId) {
        await increaseHighScore();
      }
      setWinStatus({
        isWin: RoomResult?.userId === user?.userId,
        isDraw: RoomResult?.status === "draw",
        isLose:
          RoomResult?.status === "win" && RoomResult?.userId !== user?.userId,
        playerName:
          gameData?.player1?.userId === RoomResult?.userId
            ? gameData?.player1?.userName
            : gameData?.player2?.userName,
      });
    };

    // Socket Events

    socket.on("game_started", handleGameStart);
    socket.on("player_move", handleMove);
    socket.on("player_left", handlePlayerLeft);
    socket.on("play_again", handlePlayAgain);
    socket.on("game_status", handleGameStatus);
    socket.on("rejoin_room", handleGameStart);

    // Clean up

    return () => {
      socket.off("rejoin_room", handleGameStart);
      socket.off("player_move", handleMove);
      socket.off("player_left", handlePlayerLeft);
      socket.off("play_again", handlePlayAgain);
      socket.off("game_status", handleGameStatus);
      socket.off("rejoin_room", handleGameStart);
    };
  }, [gameData, increaseHighScore, roomId, socket, user]);
  return (
    <>
      <GameBoard
        handleExitBtn={handleExit}
        handleClick={handleClick}
        board={gameData?.board || []}
        OnlineGameData={{
          playerName: (gameData?.player1?.userId !== user?.userId
            ? gameData?.player1?.userName
            : gameData?.player2?.userName) as string,
          currentSymbol: turn as "X" | "O",
          symbol: (gameData?.player1?.userId === user?.userId
            ? gameData?.player1?.symbol
            : gameData?.player2?.symbol) as "X" | "O",
        }}
      />
      <PlayerLeft
        roomId={roomId}
        open={leftDialog}
        setOpenDialog={setLeftDialog}
        resetGame={handleResetGame}
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
