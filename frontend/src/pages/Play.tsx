import OfflineTic from "@/components/Game/OfflineTic";
import OnlineTic from "@/components/Game/OnlineTic";
import RoomProvider from "@/context/RoomContext";

function Play() {
  const roomId = window.location.pathname.split("/").pop();

  console.log("roomId", roomId && roomId.startsWith("room"));

  return roomId && roomId.startsWith("room") ? (
    <RoomProvider>
      <OnlineTic />
    </RoomProvider>
  ) : (
    <OfflineTic />
  );
}

export default Play;
