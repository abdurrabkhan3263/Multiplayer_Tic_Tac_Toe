import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserNameSection from "../UserNameSection";
import { User } from "@/types";
import CustomRoom from "./CustomRoomSection";
import QuickMatch from "../QuickMatchSection";
import { useToast } from "@/hooks/use-toast";
import { io } from "socket.io-client";

interface JoinRoomProps {
  children?: React.ReactNode;
  user?: User | null;
  handleAddUser: (e: React.FormEvent<HTMLFormElement>) => void;
  IsAddingUser: boolean;
  nameDialogOpen: boolean;
  setNameDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const JoinRoom: React.FC<JoinRoomProps> = ({
  children,
  user,
  IsAddingUser,
  handleAddUser,
  nameDialogOpen,
  setNameDialogOpen,
}) => {
  const { toast } = useToast();

  React.useEffect(() => {
    const socket = io("/game");
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("connect_error", (err) => {
      console.error(`Connection error: ${err.message}`);
      toast({
        title: "Connection Error",
        description: `Failed to connect to the server: ${err.message}`,
        variant: "destructive",
      });
    });

    socket.on("error", (error: string) => {
      console.error(`Server error: ${error}`);
      toast({
        title: "Server Error",
        description: error,
        variant: "destructive",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      {!user ? (
        <UserNameSection
          handleAddUser={handleAddUser}
          user={user}
          nameDialogOpen={nameDialogOpen}
          IsAddingUser={IsAddingUser}
          setNameDialogOpen={setNameDialogOpen}
        >
          {children}
        </UserNameSection>
      ) : (
        <Dialog>
          <DialogTrigger asChild>{children}</DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Join Room</DialogTitle>
              <DialogDescription>
                Join a room to play with your friends
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="quick_match" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quick_match">Quick Match</TabsTrigger>
                <TabsTrigger value="custom_room">Custom Room</TabsTrigger>
              </TabsList>
              <QuickMatch user={user} />
              <CustomRoom user={user} />
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default JoinRoom;
