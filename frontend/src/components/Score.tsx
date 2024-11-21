import { useSocket } from "@/context/SocketProvider";

function Score() {
  const { user } = useSocket();

  if (!user || user?.tic_tac_toe_high_score <= 0) return <></>;

  return (
    <div className="flex items-center gap-3">
      <p
        className={
          "text-customYellow hover:text-customDarkYellow select-none font-gameFont text-3xl font-bold tabular-nums transition-all duration-300"
        }
      >
        {user?.tic_tac_toe_high_score}
      </p>
      <div className="h-10 w-10">
        <img
          src="/icons/score.svg"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default Score;
