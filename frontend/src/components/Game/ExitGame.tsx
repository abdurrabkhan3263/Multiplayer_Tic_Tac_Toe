import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

interface ExitGameProps {
  children: React.ReactNode;
  handleExit: () => void;
}

function ExitGame({ children, handleExit }: ExitGameProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exit Game</DialogTitle>
          <DialogDescription>
            Are you sure you want to exit the game? You will lose your progress.
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full justify-between">
          <Button variant={"gameBtn"} onClick={handleExit}>
            Exit
          </Button>
          <Button
            variant={"leaveBtn"}
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExitGame;
