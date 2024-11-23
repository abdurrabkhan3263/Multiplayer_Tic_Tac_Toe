import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types";
import AllRoom from "./ListAllRooms";
import MyRoom from "./ListOurRooms";

interface CustomRoomSectionProps {
  user: User;
}

function CustomRoomSection({ user }: CustomRoomSectionProps) {
  const [listRoom, setListRoom] = React.useState([]);
  const [listOurRoom, setListOurRoom] = React.useState([]);

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
            listOurRoom={listOurRoom}
            setListOurRoom={setListOurRoom}
          />
        </TabsContent>
        <TabsContent value="allRooms" className="my-3">
          <AllRoom user={user} listRoom={listRoom} setListRoom={setListRoom} />
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
}

export default CustomRoomSection;
