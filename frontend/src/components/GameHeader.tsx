import { useSocket } from "@/context/SocketProvider";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EmojiPath } from "@/lib/Data";
import { useRoomContext } from "@/context/RoomContext";

interface EmojiProps {
  emoji: string;
  setDisableBtn: React.Dispatch<React.SetStateAction<boolean>>;
  setPopOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Emoji: React.FC<EmojiProps> = ({
  emoji,
  setDisableBtn,
  setPopOpen,
}: EmojiProps) => {
  const { user, socket } = useSocket();
  const { roomId } = useRoomContext();

  const handleClick = () => {
    if (user) {
      setDisableBtn(true);
      setPopOpen(false);
      socket.emit("sendEmoji", {
        roomId,
        emoji,
        from: user.userId,
      });
    }
  };

  return (
    <button
      className="flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-lg border-b-2 border-gray-400 bg-white shadow-sm transition-all hover:scale-105 hover:border-b-[3px] hover:shadow-md"
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
  currentUserId?: string;
  opponentId?: string;
  setDisableBtn: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ShowEmojiProps {
  emoji: string;
  from: string;
}

const Player: React.FC<PlayerProps> = ({
  name,
  symbol,
  currentTurn,
  currentUserId,
  opponentId,
  setDisableBtn,
}) => {
  const { socket } = useSocket();
  const [showEmoji, setShowEmoji] = React.useState<ShowEmojiProps | null>(null);

  useEffect(() => {
    const handleReceiveEmoji = (data: ShowEmojiProps) => {
      if (
        (currentUserId && data.from === currentUserId) ||
        (opponentId && data.from === opponentId)
      ) {
        setShowEmoji(data);
        setTimeout(() => {
          setShowEmoji(null);
          setDisableBtn(false);
        }, 3000);
      }
    };

    socket.on("receiveEmoji", handleReceiveEmoji);

    return () => {
      socket.off("receiveEmoji", handleReceiveEmoji);
    };
  }, [currentUserId, opponentId, setDisableBtn, socket]);

  return (
    <div className="relative mx-2 h-fit w-[5rem] text-center">
      {showEmoji && (
        <span
          className="emoji-message"
          style={{ backgroundImage: `url(/emojies/${showEmoji.emoji})` }}
        ></span>
      )}
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
};

interface GameHeaderProps {
  opponentName: string;
  mySymbol: "X" | "O";
  currentTurn: "X" | "O";
  opponentId: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  opponentName,
  mySymbol,
  currentTurn,
  opponentId,
}) => {
  const { user } = useSocket();
  const opponentSymbol = mySymbol === "X" ? "O" : "X";
  const { roomId } = useRoomContext();
  const [disableEmojiBtn, setDisableEmojiBtn] = React.useState(false);
  const [popOpen, setPopOpen] = React.useState(false);

  return (
    <div className="my-2.5 h-fit w-full">
      <div className="relative flex items-center justify-center">
        {roomId && (
          <div className="absolute right-0">
            <Popover open={popOpen} onOpenChange={setPopOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"noBgOutline"}
                  size={"smallRoundedBtn"}
                  disabled={disableEmojiBtn}
                >
                  <img
                    src="/icons/message.svg"
                    alt="Back"
                    className="h-8 w-8"
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="flex flex-wrap items-center gap-3">
                  {EmojiPath.map((emojiName, i) => (
                    <Emoji
                      key={i}
                      emoji={emojiName}
                      setDisableBtn={setDisableEmojiBtn}
                      setPopOpen={setPopOpen}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
        <div className="flex items-center justify-center">
          <Player
            name={(opponentName && user?.userName) || "X"}
            symbol={mySymbol}
            currentTurn={currentTurn}
            currentUserId={user?.userId as string}
            setDisableBtn={setDisableEmojiBtn}
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
            opponentId={opponentId || ""}
            setDisableBtn={setDisableEmojiBtn}
          />
        </div>
      </div>
    </div>
  );
};
