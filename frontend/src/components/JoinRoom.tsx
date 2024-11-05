import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";
import { roomObj } from "@/types/zod";
import { useToast } from "@/hooks/use-toast";
import UserNameSection from "./UserNameSection";

interface JoinRoomProps {
  children?: React.ReactNode;
  userName?: string;
  handleAddUser: (e: React.FormEvent<HTMLFormElement>) => void;
  IsAddingUser: boolean;
  nameDialogOpen: boolean;
  setNameDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const JoinRoom: React.FC<JoinRoomProps> = ({
  children,
  userName,
  IsAddingUser,
  handleAddUser,
  nameDialogOpen,
  setNameDialogOpen,
}) => {
  const [onSubmit, setOnSubmit] = React.useState(false);
  const [matchLoading, setMatchLoading] = React.useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setOnSubmit(true);
      const formData = new FormData(e.currentTarget);

      const result = roomObj.safeParse({
        name: formData.get("roomName") as string,
        password: formData.get("password") as string,
      });

      if (!result.success) {
        const error = result.error.errors
          .map((err) => err.message)
          .join(" and ");
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(error);
    } finally {
      setOnSubmit(false);
    }
  };

  const handleQuickMatch = async () => {
    try {
      setMatchLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(error);
    } finally {
      setMatchLoading(false);
    }
  };

  const handlePlayWithFriends = () => {
    console.log("Play with friends");
  };

  return (
    <>
      {!userName ? (
        <UserNameSection
          handleAddUser={handleAddUser}
          userName={userName}
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
              <TabsContent value="quick_match" className="mt-5">
                <Button
                  size="full"
                  variant="gameBtn"
                  onClick={handleQuickMatch}
                >
                  Quick Match{" "}
                  {matchLoading && (
                    <Loader2 size={24} className="animate-spin" />
                  )}
                </Button>
              </TabsContent>
              <TabsContent value="custom_room" className="mt-5">
                <h1 className="text-lg font-semibold">Custom Room</h1>
                <form onSubmit={handleFormSubmit}>
                  <div className="mt-1.5 flex flex-col gap-4">
                    <Input name="roomName" placeholder="Enter room name" />
                    <Input name="password" placeholder="Enter room password" />
                    <Button size="full" variant="gameBtn" type="submit">
                      Join Room{" "}
                      {onSubmit && (
                        <Loader2 size={24} className="animate-spin" />
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default JoinRoom;
