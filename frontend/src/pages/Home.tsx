import JoinRoom from "@/components/Rooms/JoinRoom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNameSection from "@/components/UserNameSection";
import { useSocket } from "@/context/SocketProvider";
import Score from "@/components/Score";
import { addUser, updateUser } from "@/lib/action/user.action";
import MusicButton from "@/components/MusicButton";

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
      navigate("/play");
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
      <div className={"home_menu_card"}>
        <div className="home_menu_card_bg flex justify-center">
          <img src="/images/tic-tac-toe-image.png" alt="bg" className="h-3/4" />
        </div>
        <div className="flex w-full justify-between">
          <div className="flex items-center gap-6">
            <UserNameSection
              handleAddUser={handleAddUser}
              IsAddingUser={IsAddingUser}
              user={user}
              nameDialogOpen={nameDialogOpen}
              setNameDialogOpen={setNameDialogOpen}
            >
              <Button variant={"roundedBtn"} size={"roundedBtn"}>
                <img src="/icons/edit-profile.svg" alt="avatar" />
              </Button>
            </UserNameSection>
            <Score />
          </div>
          <MusicButton />
        </div>
        <div className="mb-20 flex h-full w-full flex-col justify-end gap-3">
          <Button
            size={"full"}
            variant={"gameBtn"}
            onClick={handlePlayWithFriends}
          >
            Play with
            <img src="/icons/users.svg" alt="friends" className="h-9" />
          </Button>
          <JoinRoom
            handleAddUser={handleAddUser}
            IsAddingUser={IsAddingUser}
            user={user}
            nameDialogOpen={nameDialogOpen}
            setNameDialogOpen={setNameDialogOpen}
          >
            <Button size={"full"} variant={"gameBtn"}>
              Play with
              <img src="/icons/internet.svg" alt="laptop" className="h-9" />
            </Button>
          </JoinRoom>
        </div>
      </div>
    </div>
  );
}

export default Home;
