import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Room, User } from "@/types";
import AllRoom from "./ListAllRooms";
import MyRoom from "./ListOurRooms";
import { useEffect, useState } from "react";
import { getAllRoom, getMyRoom } from "@/lib/action/room.action";
import { AxiosError } from "axios";

interface CustomRoomSectionProps {
  user: User;
}

function CustomRoomSection({ user }: CustomRoomSectionProps) {
  const [listAllRooms, setListAllRooms] = useState<Room[]>([]);
  const [listOurRooms, setListOurRooms] = useState<Room[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const myRoomResponse = await getMyRoom({ userId: user?.userId });

        if (myRoomResponse?.status !== "success") {
          throw new Error(myRoomResponse?.message);
        }
        setListOurRooms(myRoomResponse.data);

        const allRoomResponse = await getAllRoom();
        if (allRoomResponse?.status !== "success") {
          throw new Error(allRoomResponse?.message);
        }
        setListRooms(allRoomResponse.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : err instanceof AxiosError
              ? err.response?.data.message
              : "An error occurred";
        console.error(errorMessage);
      }
    })();
  }, [user?.userId]);

  return (
    <TabsContent value="custom_room" className="mt-5">
      <Tabs defaultValue="activeRoom" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activeRoom">My Rooms</TabsTrigger>
          <TabsTrigger value="allRooms">All Rooms</TabsTrigger>
        </TabsList>
        <TabsContent value="activeRoom" className="my-3">
          <MyRoom
            user={user}
            userName={user.userName}
            listOurRoom={listOurRooms}
            setListAllRooms={setListAllRooms}
            setListOurRooms={setListOurRooms}
          />
        </TabsContent>
        <TabsContent value="allRooms" className="my-3">
          <AllRoom
            user={user}
            listRoom={listAllRooms}
            setListAllRooms={setListAllRooms}
            setListOurRooms={setListOurRooms}
          />
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
}

export default CustomRoomSection;
