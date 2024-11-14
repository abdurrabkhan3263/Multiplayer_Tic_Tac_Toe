import JoinRoom from "@/components/Rooms/JoinRoom";
import { Button } from "@/components/ui/button";
import { Edit, Users, Volume2 } from "lucide-react";
import { BsLaptop } from "react-icons/bs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { addUser, updateUser } from "@/lib/action/user.action";
import { useNavigate } from "react-router-dom";
import UserNameSection from "@/components/UserNameSection";
import { useSocket } from "@/context/SocketProvider";

function Home() {
  const { toast } = useToast();
  const [IsAddingUser, setIsAddingUser] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, dbRef } = useSocket();

  const handlePlayWithFriends = () => {
    if (!currentUser) {
      setNameDialogOpen(true);
    } else {
      navigate("/home/play");
    }
  };

  const insertNewUser = async ({
    userName,
    userId,
  }: {
    userName: string;
    userId?: string;
  }) => {
    try {
      const res = await addUser({ userName, userId });

      if (res?.data) {
        return res.data;
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error?.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const updateUserName = async ({
    userId,
    userName,
  }: {
    userId: string;
    userName: string;
  }) => {
    try {
      await updateUser({ userId, userName });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error?.message : "Something went wrong",
        variant: "destructive",
      });
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
        await updateUserName({ userId: user.userId, userName });
        if (
          dbRef.current &&
          dbRef.current.objectStoreNames.contains("currentUser")
        ) {
          const transaction = dbRef.current.transaction(
            "currentUser",
            "readwrite",
          );
          const store = transaction.objectStore("currentUser");

          store.put({ ...user, userName });

          transaction.oncomplete = () => {
            setUser({ ...user, userName });
          };

          transaction.onerror = () => {
            toast({
              title: "Error",
              description: "Error updating user in IndexedDB",
              variant: "destructive",
            });
          };
        }
      } else {
        const newUser = await insertNewUser({ userName });

        if (
          dbRef.current &&
          dbRef.current.objectStoreNames.contains("currentUser")
        ) {
          const transaction = dbRef.current.transaction(
            "currentUser",
            "readwrite",
          );
          const store = transaction.objectStore("currentUser");

          store.add(newUser);

          transaction.oncomplete = () => {
            setUser(newUser);
          };

          transaction.onerror = () => {
            console.error("Error adding user to IndexedDB");
          };
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
