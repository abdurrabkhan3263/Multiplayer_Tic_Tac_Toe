import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ENTER_BTN_ROOM_TEXT } from "@/lib/constants";

interface RoomFormProps {
  handleRoomSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  roomName: string;
  setRoomName: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: boolean;
  btnText?: string;
  header?: string;
  roomPassword?: string;
}

function RoomForm({
  handleRoomSubmit,
  onSubmit,
  roomName,
  setRoomName,
  btnText,
  header,
  roomPassword,
}: RoomFormProps) {
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
          {((roomPassword && btnText === ENTER_BTN_ROOM_TEXT) ||
            btnText === "Create Room") && (
            <Input
              type="password"
              name="password"
              placeholder="Enter room password"
            />
          )}
          <Button size="full" variant="gameBtn" type="submit">
            {btnText}
            {onSubmit ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <img src="/icons/create.svg" alt="plus" className="h-8" />
            )}
          </Button>
        </div>
      </form>
    </>
  );
}

export default RoomForm;
