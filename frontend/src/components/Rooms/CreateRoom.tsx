import React, { memo, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RoomForm from "./RoomForm";
import { roomObj } from "@/types/zod";
import { useToast } from "@/hooks/use-toast";
import { addNewRoom } from "@/lib/action/room.action";
import { Room } from "@/types";
import { CREATE_BTN_ROOM_TEXT, CREATE_HEADER_TEXT } from "@/lib/constants";

function CreateRoom({
  userName,
  userId,
  setListOurRooms,
  setListAllRooms,
}: {
  userName: string;
  userId: string;
  setListOurRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setListAllRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}) {
  const [isEntering, setOnSubmit] = React.useState(false);
  const [roomName, setRoomName] = React.useState("");
  const [RoomDialog, setRoomDialog] = React.useState(false);
  const { toast } = useToast();

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setOnSubmit(true);
      const formData = new FormData(e.currentTarget);

      const result = roomObj.safeParse({
        name: formData.get("roomName"),
        password: formData.get("password"),
      });

      if (!result.success) {
        const error = result.error.errors
          .map((err) => err.message)
          .join(" and ");
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      const response = await addNewRoom({
        name: result.data.name,
        password: result.data?.password || "",
        userId,
      });

      if (response.status === "success") {
        setListOurRooms((prev) => [...prev, response.data]);
        setListAllRooms((prev) => [...prev, response.data]);
        toast({
          title: "Success",
          description: "Room created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error)?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setOnSubmit(false);
      setRoomDialog(false);
    }
  };

  useEffect(() => {
    if (userName) {
      setRoomName(userName + "'s_Room");
    }
  }, [userName]);

  return (
    <Dialog open={RoomDialog} onOpenChange={setRoomDialog}>
      <DialogTrigger asChild>
        <Button variant={"gameBtn"}>
          <span>Create Room</span>
          <img src="/icons/create.svg" alt="plus" className="h-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <RoomForm
          roomName={roomName}
          handleRoomSubmit={handleCreateRoom}
          setRoomName={setRoomName}
          onSubmit={isEntering}
          btnText={CREATE_BTN_ROOM_TEXT}
          header={CREATE_HEADER_TEXT}
        />
      </DialogContent>
    </Dialog>
  );
}

export default memo(CreateRoom);
