import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";

interface ExitGameProps {
  children: React.ReactNode;
}

function ExitGame({ children }: ExitGameProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exit Game</DialogTitle>
          <DialogDescription>
            Are you sure you want to exit the game? You will lose your progress.
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full justify-between">
          <Button variant={"gameBtn"}>Exit Game</Button>
          <Button variant={"leaveBtn"}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExitGame;
