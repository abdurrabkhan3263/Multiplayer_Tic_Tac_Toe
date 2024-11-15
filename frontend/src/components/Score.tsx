import { useRoomContext } from "@/context/RoomContext";
import { useSocket } from "@/context/SocketProvider";
import { useEffect } from "react";

function Score() {
  const { user } = useSocket();
  const { user: roomUser } = useRoomContext();

  useEffect(() => {
    console.log({ user, roomUser });
  }, [user, roomUser]);

  if (!user && !roomUser) return <></>;

  return (
    <div className="flex items-center gap-3">
      <p
        className={
          "select-none text-3xl font-bold tabular-nums text-blue-500 transition-all duration-300 hover:text-blue-700"
        }
      >
        {user?.tic_tac_toe_high_score || roomUser?.tic_tac_toe_high_score}
      </p>
      <div className="h-10 w-10">
        <img src="/score.svg" alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

export default Score;
