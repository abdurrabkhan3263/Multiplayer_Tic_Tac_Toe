import { useSocket } from "@/context/SocketProvider";
import { Button } from "./ui/button";

function MusicButton() {
  const { music, setMusic } = useSocket();

  const handleMusicPlay = () => {
    setMusic((prev) => !prev);
    localStorage.setItem("music", JSON.stringify(!music));
  };

  if (music === undefined) <></>;

  return (
    <Button
      variant={"roundedBtn"}
      size={"roundedBtn"}
      onClick={handleMusicPlay}
    >
      {music ? (
        <img src="/icons/sound-on.svg" alt="sound-on" />
      ) : (
        <img src="/icons/sound-off.svg" alt="sound-off" />
      )}
    </Button>
  );
}

export default MusicButton;
