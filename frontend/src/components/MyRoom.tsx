import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Room as RoomType, User } from "@/types";
import Room from "./Room";
import { getMyRoom } from "@/lib/action/room.action";
import { error } from "console";
import { AxiosError } from "axios";

interface MyRoomProps {
  userName: string;
  userId: string;
}

function MyRoom({ userName, userId }: MyRoomProps) {
  const [listRoom, setListRoom] = React.useState<RoomType[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getMyRoom({ userId });

        console.log(response);

        if (response?.status !== "success") {
          throw new Error(response?.message);
        }

        console.log(response);

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
    <ScrollArea className="h-36 min-h-fit">
      <Card className="w-full">
        <CardHeader className="px-4 pb-2 pt-4">
          <CardTitle>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">All Rooms</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <div className="flex flex-col gap-2">
            {listRoom.length > 0 ? (
              listRoom.map(({ name, password }, index) => (
                <Room key={index} name={name} password={password} />
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

export default MyRoom;
