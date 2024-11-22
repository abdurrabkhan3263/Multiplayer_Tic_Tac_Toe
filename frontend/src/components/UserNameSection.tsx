import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { User } from "@/types";

interface UserNameSectionProps {
  children: React.ReactNode;
  handleAddUser: (e: React.FormEvent<HTMLFormElement>) => void;
  IsAddingUser: boolean;
  user?: User | null;
  nameDialogOpen: boolean;
  setNameDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function UserNameSection({
  handleAddUser,
  IsAddingUser,
  user,
  nameDialogOpen,
  children,
  setNameDialogOpen,
}: UserNameSectionProps) {
  const [inputUserName, setInputUserName] = useState("");
  const [inputError, setInputError] = useState(false);

  const handleSpace = useCallback((elem: string) => {
    return elem.replace(/\s/g, "_");
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (value && value.length > 6) {
      setInputError(true);
      return;
    } else if (value.length <= 6 && inputError) {
      setInputError(false);
    }

    const name = handleSpace(value);
    setInputUserName(name);
  };

  useEffect(() => {
    setInputUserName(user?.userName || "");
  }, [user]);

  return (
    <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <div>Welcome to Tic Tac Toe</div>
          </DialogTitle>
          <DialogDescription>
            Please enter your name to play the game.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddUser}>
          <div className="mt-1.5 flex flex-col gap-4">
            <Input
              name="name"
              placeholder="Enter your name"
              value={inputUserName}
              onChange={handleInputChange}
            />
            {inputError && (
              <span className="text-sm text-white">
                Name should not exceed 6 characters
              </span>
            )}
            <Button size="full" variant="gameBtn" type="submit">
              Play{" "}
              {IsAddingUser && <Loader2 size={24} className="animate-spin" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserNameSection;
