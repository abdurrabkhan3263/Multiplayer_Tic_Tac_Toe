import JoinRoom from "@/components/JoinRoom";
import { Button } from "@/components/ui/button";
import { Volume2, Users } from "lucide-react";
import { BsLaptop } from "react-icons/bs";

function Home() {
  const handlePlayWithFriends = () => {
    console.log("Play with friends");
  };

  return (
    <div className="home_menu">
      <div
        className="home_menu_card flex flex-col"
        style={{ backgroundImage: "url(/bg_menu.jpg)" }}
      >
        <div className="flex w-full justify-end">
          <Button variant={"gameBtn"}>
            <Volume2 size={24} />
          </Button>
        </div>
        <div className="mb-16 flex h-full w-full flex-col justify-end gap-3">
          <Button
            size={"full"}
            variant={"gameBtn"}
            onClick={handlePlayWithFriends}
          >
            Play with <Users size={24} />
          </Button>
          <JoinRoom>
            <Button size={"full"} variant={"gameBtn"}>
              Play with <BsLaptop size={24} />
            </Button>
          </JoinRoom>
        </div>
      </div>
    </div>
  );
}

export default Home;
