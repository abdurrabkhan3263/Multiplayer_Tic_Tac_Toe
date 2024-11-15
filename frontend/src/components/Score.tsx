import { useSocket } from "@/context/SocketProvider";
import { useEffect, useState } from "react";

function Score({ tic_tac_toe_score }: { tic_tac_toe_score: number }) {
  const [score, setScore] = useState<number>(0);
  const { user } = useSocket();

  useEffect(() => {
    if (tic_tac_toe_score <= 0) return;

    const interval = setInterval(() => {
      setScore((prev) => {
        if (prev < tic_tac_toe_score) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 100);
  }, [tic_tac_toe_score]);

  useEffect(() => {
    console.log({ user });
  }, [user]);

  return (
    <div className="flex items-center gap-3">
      <p
        className={
          "select-none text-3xl font-bold tabular-nums text-blue-500 transition-all duration-300 hover:text-blue-700"
        }
      >
        {score}
      </p>
      <div className="h-10 w-10">
        <img src="/score.svg" alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

export default Score;
