import { useSocket } from "@/context/SocketProvider";
import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EmojiPath } from "@/lib/Data";

interface EmojiProps {
  emoji: string;
}

const Emoji: React.FC<EmojiProps> = ({ emoji }: EmojiProps) => {
  const handleClick = () => {
    alert(`You clicked on ${emoji}`);
  };

  return (
    <button
      className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-lg border-b-2 border-gray-400 bg-white shadow-sm transition-all hover:scale-105 hover:border-b-4 hover:shadow-md"
      onClick={handleClick}
    >
      <img src={`/emojies/${emoji}`} alt={emoji} className="h-9 w-9" />
    </button>
  );
};

interface PlayerProps {
  name: string;
  symbol: "X" | "O";
  currentTurn: "X" | "O";
}

const Player: React.FC<PlayerProps> = ({ name, symbol, currentTurn }) => (
  <div className="relative mx-2 h-fit w-[5rem] text-center">
    <span className="emoji-message"></span>
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
  const [showEmoji, setShowEmoji] = React.useState({
    emoji: "",
    from: "",
    to: "",
  });

  return (
    <div className="my-2.5 h-fit w-full">
      <div className="relative flex items-center justify-center">
        <div className="absolute left-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"noBgOutline"} size={"smallRoundedBtn"}>
                <img src="/icons/message.svg" alt="Back" className="h-8 w-8" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex flex-wrap items-center gap-3">
                {EmojiPath.map((emojiName, i) => (
                  <Emoji key={i} emoji={emojiName} />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center justify-center">
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
    </div>
  );
};
