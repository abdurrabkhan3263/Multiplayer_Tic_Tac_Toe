import OfflineTic from "@/components/Game/OfflineTic";
import OnlineTic from "@/components/Game/OnlineTic";
import RoomProvider from "@/context/RoomContext";

function Play() {
  const roomId = window.location.pathname.split("/").pop();

  return (
    <RoomProvider>
      {roomId && roomId.startsWith("room") ? <OnlineTic /> : <OfflineTic />}
    </RoomProvider>
  );
}

export default Play;
