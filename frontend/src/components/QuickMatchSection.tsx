import React, { useEffect, useRef } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GameError, User } from "@/types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/context/SocketProvider";

interface QuickMatchProps {
  user: User;
}

function QuickMatchSection({ user }: QuickMatchProps) {
  const [matchLoading, setMatchLoading] = React.useState(false);
  const { toast } = useToast();
  const [matchSearchingDialog, setMatchSearchingDialog] = React.useState(false);
  const roomId = useRef<{ roomName: string } | null>(null);
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
    socket.on("match_found", ({ roomName, message }) => {
      setMatchSearchingDialog(false);
      toast({
        title: "Match Found",
        description: message || "Match found successfully",
      });
      navigate(`/home/play/${roomName}`);
    });

    socket.on("emit_joined_into_room", (data: any) => {
      setMatchSearchingDialog(true);
      roomId.current = data;
    });

    socket.on("error", (error: GameError) => {
      setMatchSearchingDialog(false);
      toast({
        title: "Error",
        description: error?.message || "An error occurred",
        variant: "destructive",
      });
    });
  }, []);

  return (
    <TabsContent value="quick_match" className="mt-5">
      <Button
        size="full"
        variant="gameBtn"
        onClick={handleQuickMatch}
        disabled={matchSearchingDialog}
      >
        Quick Match{" "}
        {matchLoading && <Loader2 size={24} className="animate-spin" />}
      </Button>
      {matchSearchingDialog && (
        <div className="mt-5">
          <p className="text-center text-lg font-semibold">
            Searching for a match...
          </p>
        </div>
      )}
    </TabsContent>
  );
}

export default QuickMatchSection;
