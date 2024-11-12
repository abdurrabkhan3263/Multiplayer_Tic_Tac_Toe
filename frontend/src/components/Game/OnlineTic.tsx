import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import GameBoard from "./GameBoard";
import { useRoomContext } from "@/context/RoomContext";
import { useSocket } from "@/context/SocketProvider";
import { useNavigate } from "react-router-dom";
import PlayerLeft from "./PlayerLeft";
import PlayerWin from "./PlayerWin";
import { GameData, Turn } from "@/types";

function OnlineTic({ user }: { user: User }) {
  const turn = useRef<Turn | null>();
  const [uiTurn, setUiTurn] = useState<Turn | null>(null);
  const gameData = useRef<GameData | null>(null);

  const counter = useRef(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [winStatus, setWinStatus] = useState({
    isWin: false,
    player: "",
  });
  const [leftDialog, setLeftDialog] = useState<boolean>(false);
  const navigate = useNavigate();
  const socket = useSocket();
  const { roomId, user, roomName } = useRoomContext();

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
      setWinStatus({
        isWin: true,
        player: turn.current,
      });
      setOpenDialog(true);
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

    if (target.firstChild) return;

    handleTurn(target);
  };

  const handleExitBtn = () => {
    socket.emit("player_left", { roomId });
    navigate("/home");
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

  // Socket Related

  useEffect(() => {
    const handlePlayerLeft = () => {
      setLeftDialog(true);
      console.log("Player left the game");
    };

    socket.on("player_left", handlePlayerLeft);

    return () => {
      socket.off("player_left", handlePlayerLeft);
    };
  }, [socket]);

  // Game Start

  useEffect(() => {
    socket.emit("start_game", { roomId });
  }, [roomId, socket]);

  // Game Start event
  useEffect(() => {
    // Handle Functions

    const gameStarted = (data: GameData) => {
      console.log("User id is:- ", user);
      console.log("Game Started", data);
    };

    const handleGameWin = (data) => {
      console.log("Game Win", data);
    };

    const handleGameDraw = (data) => {
      console.log("Game Draw", data);
    };

    // Socket Events

    socket.on("game_started", gameStarted);
    socket.on("game_win", handleGameWin);
    socket.on("game_draw", handleGameDraw);

    return () => {
      socket.off("game_started", gameStarted);
      socket.off("game_win", handleGameWin);
    };
  }, [socket, user]);

  return (
    <>
      <GameBoard
        counter={counter}
        openDialog={openDialog}
        resetGame={resetGame}
        winStatus={winStatus}
        uiTurn={uiTurn}
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
