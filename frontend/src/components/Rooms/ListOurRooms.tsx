import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Room, Room as RoomType, User } from "@/types";
import RoomElem from "./RoomElem";
import CreateRoom from "./CreateRoom";
import NotAvailable from "./NotAvailable";

interface ListOurRoomsProps {
  userName: string;
  user: User;
  listOurRoom: RoomType[];
  setListAllRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setListOurRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

function ListOurRooms({
  userName,
  user,
  listOurRoom: listRoom,
  setListAllRooms,
  setListOurRooms,
}: ListOurRoomsProps) {
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
                setListAllRooms={setListAllRooms}
                setListOurRooms={setListOurRooms}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <div className="flex flex-col gap-2">
            {listRoom.length > 0 ? (
              listRoom.map(
                ({ roomId, roomName, password, playerCount, type }, index) => (
                  <RoomElem
                    key={index}
                    roomId={roomId}
                    name={roomName}
                    password={password}
                    user={user}
                    participants={playerCount}
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
