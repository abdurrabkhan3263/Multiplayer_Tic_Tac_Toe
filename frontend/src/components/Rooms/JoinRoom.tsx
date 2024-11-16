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
import { useSocket } from "@/context/SocketProvider";

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
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleOpenChange = () => {
    setOpenDialog((prev) => !prev);
  };

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
        <Dialog open={openDialog} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>{children}</DialogTrigger>
          <DialogContent className="text-white sm:max-w-[425px]">
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
