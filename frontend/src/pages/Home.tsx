import JoinRoom from "@/components/JoinRoom";
import { Button } from "@/components/ui/button";
import { Volume2, Users, Edit } from "lucide-react";
import { BsLaptop } from "react-icons/bs";
import { useToast } from "@/hooks/use-toast";
import { DB_NAME } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";
import UserNameSection from "@/components/UserNameSection";
import { User } from "@/types";
import { addUser, getUser, updateUser } from "@/lib/action/user.action";
import { AxiosError } from "axios";

function Home() {
  const { toast } = useToast();
  const dbRef = useRef<IDBDatabase | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [IsAddingUser, setIsAddingUser] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);

  const handlePlayWithFriends = () => {
    console.log("Play with friends");
  };

  const insertNewUser = async ({ userName }: { userName: string }) => {
    try {
      const res = await addUser({ userName });

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

  useEffect(() => {
    const request = indexedDB.open(DB_NAME, 3);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("currentUser")) {
        const currentUserS = db.createObjectStore("currentUser", {
          keyPath: "userId",
        });
        currentUserS.createIndex("userName", "userName", { unique: true });
        currentUserS.createIndex(
          "tic_tac_toe_high_score",
          "tic_tac_toe_high_score",
          { unique: false },
        );
      }
    };

    request.onsuccess = async () => {
      dbRef.current = request.result;
      const transaction = dbRef.current.transaction("currentUser", "readonly");
      const store = transaction.objectStore("currentUser");

      dbRef.current.onversionchange = () => {
        dbRef.current?.close();
        toast({
          title: "Database is outdated",
          description: "Please refresh the page",
          variant: "destructive",
        });
      };

      store.getAll().onsuccess = async (event) => {
        const users = (event.target as IDBRequest).result as User[];
        setCurrentUser(users[0]);

        console.log("Users are:- ", users);

        if (users.length > 0) {
          try {
            const user = await getUser({ userId: users[0].userId });
            console.log("User is:- ", user);
          } catch (error) {
            const AxiosError = error as AxiosError;
            if (AxiosError.status === 404) {
              const newUser = await insertNewUser({
                userName: users[0].userName,
              });

              if (newUser) {
                const transaction = dbRef.current?.transaction(
                  "currentUser",
                  "readwrite",
                );
                const store = transaction?.objectStore("currentUser");

                store?.put(newUser);
              }
            }
          }
        }
      };
    };
  }, []);

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

      if (currentUser) {
        await updateUserName({ userId: currentUser.userId, userName });

        if (
          dbRef.current &&
          dbRef.current.objectStoreNames.contains("currentUser")
        ) {
          const transaction = dbRef.current.transaction(
            "currentUser",
            "readwrite",
          );
          const store = transaction.objectStore("currentUser");

          store.put({ ...currentUser, userName });

          transaction.oncomplete = () => {
            console.log("User updated in IndexedDB");
            setCurrentUser({ ...currentUser, userName });
          };

          transaction.onerror = () => {
            console.error("Error updating user in IndexedDB");
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
            console.log("User added to IndexedDB");
            setCurrentUser(newUser);
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
      <div
        className="home_menu_card flex flex-col"
        style={{ backgroundImage: "url(/bg_menu.jpg)" }}
      >
        <div className="flex w-full justify-between">
          <UserNameSection
            handleAddUser={handleAddUser}
            IsAddingUser={IsAddingUser}
            user={currentUser}
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
            userName={currentUser?.userName}
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
  );
}

export default Home;
