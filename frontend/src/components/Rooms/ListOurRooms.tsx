import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Room as RoomType } from "@/types";
import RoomElem from "./RoomElem";
import { getMyRoom } from "@/lib/action/room.action";
import { AxiosError } from "axios";
import CreateRoom from "./CreateRoom";

interface ListOurRoomsProps {
  userName: string;
  userId: string;
}

function ListOurRooms({ userName, userId }: ListOurRoomsProps) {
  const [listRoom, setListRoom] = React.useState<RoomType[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getMyRoom({ userId });

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
  }, []);

  return (
    <ScrollArea className={`${listRoom.length > 0 ? "h-[200px]" : ""} w-full`}>
      <Card className="w-full">
        <CardHeader className="px-4 pb-2 pt-4">
          <CardTitle>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">All Rooms</div>
              <CreateRoom
                userId={userId}
                userName={userName}
                setListRoom={setListRoom}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <div className="flex flex-col gap-2">
            {listRoom.length > 0 ? (
              listRoom.map(({ name, password }, index) => (
                <RoomElem key={index} name={name} password={password} />
              ))
            ) : (
              <div className="text-center">No room available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
}

export default ListOurRooms;
