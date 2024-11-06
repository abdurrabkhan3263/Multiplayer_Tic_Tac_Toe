import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { roomObj } from "@/types/zod";
import { useToast } from "@/hooks/use-toast";
import UserNameSection from "./UserNameSection";
import { User } from "@/types";
import CustomRoom from "./CustomRoom";
import QuickMatch from "./QuickMatch";

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
              <DialogTitle>
                <h2>Join Room</h2>
              </DialogTitle>
              <DialogDescription>
                <p>Join a room to play with your friends</p>
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="quick_match" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quick_match">Quick Match</TabsTrigger>
                <TabsTrigger value="custom_room">Custom Room</TabsTrigger>
              </TabsList>
              <QuickMatch />
              <CustomRoom user={user} />
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default JoinRoom;
