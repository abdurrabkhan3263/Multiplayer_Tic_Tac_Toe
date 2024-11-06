import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { roomObj } from "@/types/zod";
import { User } from "@/types";
import AllRoom from "./AllRoom";
import MyRoom from "./MyRoom";
import EnterRoom from "./EnterRoom";
import { addNewRoom } from "@/lib/action/room.action";

interface CustomRoomProps {
  user: User;
}

function CustomRoom({ user }: CustomRoomProps) {
  const [roomName, setRoomName] = React.useState("");
  const [onSubmit, setOnSubmit] = React.useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setRoomName(user.userName + "'s_Room");
    }
  }, [user]);

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setOnSubmit(true);
      const formData = new FormData(e.currentTarget);

      const result = roomObj.safeParse({
        name: formData.get("roomName") as string,
        password: formData.get("password") as string,
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

      console.log(result.data);

      const response = await addNewRoom({
        name: result.data.name,
        password: result.data.password,
        userId: user.userId,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Room created successfully",
        });
        setRoomName("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as any)?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setOnSubmit(false);
    }
  };

  return (
    <TabsContent value="custom_room" className="mt-5">
      <Tabs defaultValue="activeRoom" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activeRoom">My Rooms</TabsTrigger>
          <TabsTrigger value="allRooms">All Rooms</TabsTrigger>
        </TabsList>
        <TabsContent value="activeRoom" className="my-3">
          <MyRoom userId={user.userId} userName={user.userName} />
        </TabsContent>
        <TabsContent value="allRooms" className="my-3">
          <AllRoom user={user} />
        </TabsContent>
      </Tabs>
      <EnterRoom
        handleRoomSubmit={handleCreateRoom}
        onSubmit={onSubmit}
        roomName={roomName}
        setRoomName={setRoomName}
      />
    </TabsContent>
  );
}

export default CustomRoom;
