import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Room as RoomType, User } from "@/types";
import RoomElem from "./RoomElem";
import { getMyRoom } from "@/lib/action/room.action";
import { AxiosError } from "axios";
import CreateRoom from "./CreateRoom";
import NotAvailable from "./NotAvailable";

interface ListOurRoomsProps {
  userName: string;
  user: User;
}

function ListOurRooms({ userName, user }: ListOurRoomsProps) {
  const [listRoom, setListRoom] = React.useState<RoomType[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getMyRoom({ userId: user?.userId });

        if (response?.status !== "success") {
          throw new Error(response?.message);
        }
        setListRoom(response.data);
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
  }, [user]);

  return (
    <ScrollArea className={`${listRoom.length > 0 ? "h-[200px]" : ""}`}>
      <Card className="w-full bg-custom-blue text-white">
        <CardHeader className="px-4 pb-2 pt-4">
          <CardTitle>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">My Rooms</div>
              <CreateRoom
                userId={user?.userId}
                userName={userName}
                setListRoom={setListRoom}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <div className="flex flex-col gap-2">
            {listRoom.length > 0 ? (
              listRoom.map(
                ({ roomId, roomName, password, clientCount, type }, index) => (
                  <RoomElem
                    key={index}
                    roomId={roomId}
                    name={roomName}
                    password={password}
                    user={user}
                    participants={clientCount}
                    type={type}
                  />
                ),
              )
            ) : (
              <NotAvailable />
            )}
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
}

export default ListOurRooms;
