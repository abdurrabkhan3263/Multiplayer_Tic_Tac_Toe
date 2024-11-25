import React from "react";
import { Room as Roomtype, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import RoomElem from "./RoomElem";
import CreateRoom from "./CreateRoom";
import NotAvailable from "./NotAvailable";

interface MyRoomProps {
  user: User;
  listRoom: Roomtype[];
  setListAllRooms: React.Dispatch<React.SetStateAction<Roomtype[]>>;
  setListOurRooms: React.Dispatch<React.SetStateAction<Roomtype[]>>;
}

function ListAllRooms({
  user,
  listRoom,
  setListAllRooms,
  setListOurRooms,
}: MyRoomProps) {
  return (
    <ScrollArea className={`${listRoom.length > 0 ? "h-[200px]" : ""} w-full`}>
      <Card className="w-full bg-custom-blue text-white">
        <CardHeader className="px-4 pb-2 pt-4">
          <CardTitle>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">All Rooms</div>
              <CreateRoom
                userId={user.userId}
                userName={user.userName}
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
                ({ roomName, password, roomId, type, playerCount }, index) => (
                  <RoomElem
                    user={user}
                    key={index}
                    name={roomName}
                    password={password}
                    roomId={roomId}
                    type={type}
                    participants={playerCount}
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

export default ListAllRooms;
