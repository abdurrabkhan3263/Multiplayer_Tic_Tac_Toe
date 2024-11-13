import OfflineTic from "@/components/Game/OfflineTic";
import OnlineTic from "@/components/Game/OnlineTic";
import RoomProvider from "@/context/RoomContext";

function Play() {
  const roomId = window.location.pathname.split("/").pop();

  console.log("Room ID", roomId);

  return <RoomProvider>{roomId ? <OnlineTic /> : <OfflineTic />}</RoomProvider>;
}

export default Play;
