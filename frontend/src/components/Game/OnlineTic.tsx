import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import GameBoard from "./GameBoard";
import { useRoomContext } from "@/context/RoomContext";
import { useSocket } from "@/context/SocketProvider";
import { useNavigate } from "react-router-dom";
import PlayerLeft from "./PlayerLeft";
import PlayerWin from "./PlayerWin";
import { GameData, ToggleTurn, Turn, WinStatusType } from "@/types";

function OnlineTic() {
  const [turn, setTurn] = useState<Turn | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);

  const counter = useRef(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [winStatus, setWinStatus] = useState<WinStatusType>({
    isDraw: undefined,
    isWin: undefined,
    playerName: "",
  });
  const [leftDialog, setLeftDialog] = useState<boolean>(false);
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { roomId, roomName, user } = useRoomContext();

  const resetGame = () => {
    const boxes = document.querySelectorAll(".tic_tac_box");
    const boxArray = Array.from(boxes);

    boxArray.forEach((box) => {
      box.innerHTML = "";
    });

    counter.current = 0;
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
      const player = gameData?.turn;

      if (!player) return;

      socket.emit("player_win", {
        roomId,
        player,
      });
      setWinStatus({
        isDraw: undefined,
        isWin: true,
        playerId: player,
        playerName: "Abdur Rab Khan",
      });
      setOpenDialog(true);
    }

    if (counter.current === 9) {
      socket.emit("game_draw", { roomId });
    }
  };

  const AddDivElement = () => {
    const currentTurnValue: "X" | "O" | null =
      gameData && gameData.turn ? gameData[gameData.turn] : null;

    if (!currentTurnValue) return "";

    return `<div id="${currentTurnValue}" class="toggle_item_inactive select-none">
    <div class="w-h-20 mx-2 h-20 overflow-hidden}">
      <img src="/${currentTurnValue}.png" class="h-full w-full object-cover"/>
    </div>`;
  };

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.currentTarget as HTMLElement;

      if (target.firstChild) return;

      if (gameData?.turn !== user?.userId) {
        console.log("Not your turn");
        return;
      }

      const index = target.parentElement
        ? Array.from(target.parentElement.children).indexOf(target)
        : -1;

      socket.emit("player_turn", {
        roomId,
        boxId: index,
        userId: gameData?.turn,
      });
    },
    [gameData?.turn, roomId, socket, user?.userId],
  );

  const handleExitBtn = () => {
    socket.emit("player_left", { roomId });
    navigate("/home");
  };

  // Event Listeners for boxes

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

  // Game Start

  useEffect(() => {
    socket.emit("start_game", { roomId });
  }, [roomId, socket]);

  // Game Start event
  useEffect(() => {
    // Handle Functions

    const gameStarted = (data: GameData) => {
      console.log("Game Started", data);
      const currentTurnValue: "X" | "O" = data[data.turn];
      setTurn({ [data?.turn as string]: currentTurnValue });
      setGameData(data);
    };

    const handleGameWin = () => {
      console.log("Game Win");
      setWinStatus({
        isDraw: undefined,
        isWin: true,
        playerName: "Abdur Rab Khan",
      });
    };

    const handleGameDraw = () => {
      console.log("Game Draw");
      setWinStatus({
        isDraw: true,
        isWin: undefined,
        playerName: "",
      });
    };

    const handleTurn = ({ boxId, turn }: ToggleTurn) => {
      if (!gameData) return;
      const boxes = document.querySelectorAll(".tic_tac_box");
      const boxArray = Array.from(boxes);
      boxArray[boxId].innerHTML = AddDivElement();
      counter.current += 1;
      const nextTurn = {
        [turn]: gameData ? (gameData[turn] as "X" | "O") : "X",
      };
      setTurn(nextTurn);
      setGameData((prev) => ({
        ...prev,
        turn: gameData[turn],
      }));
      checkIsWin();
    };

    const handlePlayerLeft = () => {
      setLeftDialog(true);
    };

    // Socket Events

    socket.on("game_started", gameStarted);
    socket.on("game_win", handleGameWin);
    socket.on("game_draw", handleGameDraw);
    socket.on("player_turn", handleTurn);
    socket.on("player_left", handlePlayerLeft);

    // Clean up

    return () => {
      socket.off("game_started", gameStarted);
      socket.off("game_win", handleGameWin);
      socket.off("game_draw", handleGameDraw);
      socket.off("player_turn", handleTurn);
      socket.off("player_left", handlePlayerLeft);
    };
  }, [roomId, socket, user]);

  useEffect(() => {
    console.log("Turn is:- ", turn);
    console.log("Game Data is:- ", gameData);
  }, [gameData, turn]);

  return (
    <>
      <GameBoard
        counter={counter}
        openDialog={openDialog}
        resetGame={resetGame}
        winStatus={winStatus}
        uiTurn={gameData ? gameData[gameData.turn] : "X"}
        setOpenDialog={setOpenDialog}
        handleExitBtn={handleExitBtn}
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
        setOpenDialog={setWinStatus}
      />
    </>
  );
}

export default OnlineTic;
