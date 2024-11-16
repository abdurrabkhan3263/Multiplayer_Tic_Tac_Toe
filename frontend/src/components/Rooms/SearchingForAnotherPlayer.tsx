import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface SearchingForAnotherPlayerProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function SearchingForAnotherPlayer({
  dialogOpen,
  setDialogOpen,
}: SearchingForAnotherPlayerProps) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        hello how are you
      </DialogContent>
    </Dialog>
  );
}

export default SearchingForAnotherPlayer;
