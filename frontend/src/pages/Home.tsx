import JoinRoom from "@/components/Rooms/JoinRoom";
import { Button } from "@/components/ui/button";
import { Edit, Users, Volume2 } from "lucide-react";
import { BsLaptop } from "react-icons/bs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNameSection from "@/components/UserNameSection";
import { useSocket } from "@/context/SocketProvider";
import Score from "@/components/Score";
import { addUser, updateUser } from "@/lib/action/user.action";

function Home() {
  const { toast } = useToast();
  const [IsAddingUser, setIsAddingUser] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useSocket();

  const handlePlayWithFriends = () => {
    if (!user?.userName) {
      setNameDialogOpen(true);
    } else {
      navigate("/home/play");
    }
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsAddingUser(true);
      const formData = new FormData(e.currentTarget);
      const userName = formData.get("name") as string;

      if (!userName) {
        toast({
          title: "Error",
          description: "Please enter your name",
          variant: "destructive",
        });
        return;
      }

      if (user) {
        const updatedUser = { ...user, userName };
        await updateUser(updatedUser);

        setUser(updatedUser);
      } else {
        const newUser = await addUser({ userName });

        if (newUser) {
          setUser(newUser);
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error?.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsAddingUser(false);
      setNameDialogOpen(false);
    }
  };

  return (
    <div className="home_menu">
      <div className={"home_menu_card_bg home_menu_card"}>
        <div className="flex w-full justify-between">
          <div className="flex items-center gap-6">
            <UserNameSection
              handleAddUser={handleAddUser}
              IsAddingUser={IsAddingUser}
              user={user}
              nameDialogOpen={nameDialogOpen}
              setNameDialogOpen={setNameDialogOpen}
            >
              <Button variant={"gameBtn"}>
                <Edit size={24} />
              </Button>
            </UserNameSection>
            <Score />
          </div>
          <Button variant={"gameBtn"}>
            <Volume2 size={24} />
          </Button>
        </div>
        <div
          className={"mb-16 flex h-full w-full flex-col items-end gap-3 pt-3"}
        >
          <div className="mb-16 flex h-full w-full flex-col justify-end gap-3">
            <Button
              size={"full"}
              variant={"gameBtn"}
              onClick={handlePlayWithFriends}
            >
              Play with <Users size={24} />
            </Button>
            <JoinRoom
              handleAddUser={handleAddUser}
              IsAddingUser={IsAddingUser}
              user={user}
              nameDialogOpen={nameDialogOpen}
              setNameDialogOpen={setNameDialogOpen}
            >
              <Button size={"full"} variant={"gameBtn"}>
                Play with <BsLaptop size={24} />
              </Button>
            </JoinRoom>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
