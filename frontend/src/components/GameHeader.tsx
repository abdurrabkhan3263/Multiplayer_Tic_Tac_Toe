import { useSocket } from "@/context/SocketProvider";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";

interface PlayerProps {
  name: string;
  symbol: "X" | "O";
  currentTurn: "X" | "O";
}

const Player: React.FC<PlayerProps> = ({ name, symbol, currentTurn }) => (
  <div className="mx-2 h-fit w-[5rem] overflow-hidden text-center">
    <span
      className={cn(
        currentTurn === symbol ? "font-bold text-customYellow" : "text-white",
        "truncate text-sm",
      )}
    >
      {name.slice(0, 6)}
    </span>
    <img
      src={`/icons/${symbol}_profile.svg`}
      alt={`${symbol} profile`}
      className="h-full w-full object-cover"
    />
  </div>
);

interface GameHeaderProps {
  opponentName: string;
  mySymbol: "X" | "O";
  currentTurn: "X" | "O";
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  opponentName,
  mySymbol,
  currentTurn,
}) => {
  const { user } = useSocket();
  const opponentSymbol = mySymbol === "X" ? "O" : "X";

  return (
    <div className="my-2.5 h-fit w-full">
      <div className="relative flex items-center justify-center">
        <Player
          name={(opponentName && user?.userName) || "X"}
          symbol={mySymbol}
          currentTurn={currentTurn}
        />
        <span className="mx-2 h-11 w-11">
          <img
            src="/icons/vs.svg"
            alt="VS"
            className="h-full w-full object-contain"
          />
        </span>
        <Player
          name={opponentName || "O"}
          symbol={opponentSymbol}
          currentTurn={currentTurn}
        />
      </div>
    </div>
  );
};
