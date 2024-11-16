import React, { useEffect, useRef } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GameError, User } from "@/types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/context/SocketProvider";
import SearchingForAnotherPlayer from "./Rooms/SearchingForAnotherPlayer";

interface QuickMatchProps {
  user: User;
}

function QuickMatchSection({ user }: QuickMatchProps) {
  const [matchLoading, setMatchLoading] = React.useState(false);
  const [roomId, setRoomId] = React.useState<string>();
  const { toast } = useToast();
  const [matchSearchingDialog, setMatchSearchingDialog] = React.useState(false);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const handleQuickMatch = async () => {
    try {
      setMatchLoading(true);
      socket.emit("join_into_room", user);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setMatchLoading(false);
    }
  };

  useEffect(() => {
    socket.on("match_found", ({ roomId: resRoomId }) => {
      setMatchSearchingDialog(false);
      navigate(`/home/play/${resRoomId}`);
    });

    socket.on("emit_joined_into_room", ({ roomId: resRoomId }) => {
      setMatchSearchingDialog(true);
      setRoomId(resRoomId);
    });

    socket.on("error", (error: GameError) => {
      setMatchSearchingDialog(false);
      toast({
        title: "Error",
        description: error?.message || "An error occurred",
        variant: "destructive",
      });
    });
  }, [navigate, socket, toast]);

  return (
    <TabsContent value="quick_match" className="mt-5">
      <Button
        size="full"
        variant="gameBtn"
        onClick={handleQuickMatch}
        disabled={matchSearchingDialog}
      >
        Quick Match
        {matchLoading ? (
          <Loader2 size={24} className="animate-spin" />
        ) : (
          <img src="/icons/quick.svg" alt="quick-match" className="h-9" />
        )}
      </Button>
      <SearchingForAnotherPlayer
        dialogOpen={matchSearchingDialog}
        setDialogOpen={setMatchSearchingDialog}
        roomId={roomId || ""}
      />
    </TabsContent>
  );
}

export default QuickMatchSection;
