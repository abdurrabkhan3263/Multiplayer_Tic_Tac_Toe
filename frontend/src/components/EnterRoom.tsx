import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface EnterRoomProps {
  handleRoomSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  roomName: string;
  setRoomName: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: boolean;
  btnText?: string;
  header?: string;
}

function EnterRoom({
  handleRoomSubmit,
  onSubmit,
  roomName,
  setRoomName,
  btnText = "Create Room",
  header = "Custom Room",
}: EnterRoomProps) {
  return (
    <>
      <h1 className="text-lg font-semibold">{header}</h1>
      <form onSubmit={handleRoomSubmit}>
        <div className="mt-1.5 flex flex-col gap-4">
          <Input
            name="roomName"
            placeholder="Enter room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <Input
            type="password"
            name="password"
            placeholder="Enter room password"
          />
          <Button size="full" variant="gameBtn" type="submit">
            {btnText}
            {onSubmit && <Loader2 size={24} className="animate-spin" />}
          </Button>
        </div>
      </form>
    </>
  );
}

export default EnterRoom;
