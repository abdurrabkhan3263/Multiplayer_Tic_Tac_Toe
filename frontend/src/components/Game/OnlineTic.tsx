import { useCallback, useEffect, useRef, useState } from "react";
import GameBoard from "./GameBoard";
import { useRoomContext } from "@/context/RoomContext";
import { useSocket } from "@/context/SocketProvider";
import { useNavigate } from "react-router-dom";
import PlayerLeft from "./PlayerLeft";
import PlayerWin from "./PlayerWin";
import { GameData, ToggleTurn, WinStatusType } from "@/types";
import { DB_NAME, SCORE_INC } from "@/lib/constants";

function OnlineTic() {
  const [gameData, setGameData] = useState<GameData | null>(null);

  const counter = useRef(0);
  const [winStatus, setWinStatus] = useState<WinStatusType>({
    isWin: false,
    isDraw: false,
    isLose: false,
    playerName: "",
  });
  const [leftDialog, setLeftDialog] = useState<boolean>(false);
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { roomId, user } = useRoomContext();

  const resetGame = () => {
    const boxes = document.querySelectorAll(".tic_tac_box");
    const boxArray = Array.from(boxes);

    boxArray.forEach((box) => {
      box.innerHTML = "";
    });

    counter.current = 0;
  };

  const checkIsWin = useCallback(() => {
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
  }, [gameData?.turn, user?.userId, user?.userName, socket, roomId]);

  const AddDivElement = useCallback(() => {
    const currentTurnValue: "X" | "O" | null =
      gameData && gameData.turn ? gameData[gameData.turn] : null;

    if (!currentTurnValue) return "";

    return `<div id="${currentTurnValue}" class="toggle_item_inactive select-none">
    <div class="w-h-20 mx-2 h-20 overflow-hidden}">
      <img src="/${currentTurnValue}.png" class="h-full w-full object-cover"/>
    </div>`;
  }, [gameData]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.currentTarget as HTMLElement;

      if (target.firstChild) return;

      if (gameData?.turn !== user?.userId) {
        target.parentElement?.classList.add("animate-shake");
        return;
      } else {
        target.parentElement?.classList.remove("animate-shake");
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

  const handlePlayAgain = () => {
    socket.emit("play_again", { roomId });
  };

  const increaseHighScore = async () => {
    if (!user) return;

    socket.emit("increase_high_score", {
      userId: user.userId,
      incBy: SCORE_INC,
    });

    const request = indexedDB.open(DB_NAME, 3);

    request.onsuccess = async () => {
      const db = request.result;
      const transaction = db.transaction("currentUser", "readwrite");
      const userStore = transaction.objectStore("currentUser");

      userStore.openCursor().onsuccess = (event) => {
        console.log("Cursor Event:: ", event);

        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const updatedUser = {
            ...cursor.value,
            tic_tac_toe_high_score:
              cursor.value.tic_tac_toe_high_score + SCORE_INC,
          };
          cursor.update(updatedUser);
          socket.emit("increase_high_score", {
            userId: user.userId,
            incBy: SCORE_INC,
          });
        }
      };

      transaction.oncomplete = () => {
        console.log("High Score Updated");
      };

      transaction.onerror = (error) => {
        console.error("Error:: ", error);
      };
    };

    request.onerror = (error) => {
      console.error("Error:: ", error);
    };
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
      const boxes = document.querySelectorAll(".tic_tac_box");
      const boxArray = Array.from(boxes);
      boxArray[boxId].innerHTML = AddDivElement();
      boxArray[boxId].firstElementChild?.classList.replace(
        "toggle_item_inactive",
        "toggle_item_active",
      );

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
  }, [AddDivElement, checkIsWin, gameData, roomId, socket, user]);

  return (
    <>
      <GameBoard
        uiTurn={gameData ? gameData[gameData.turn] : "X"}
        handleExitBtn={handleExitBtn}
        tic_tac_toe_score={Number(user?.tic_tac_toe_high_score)}
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
