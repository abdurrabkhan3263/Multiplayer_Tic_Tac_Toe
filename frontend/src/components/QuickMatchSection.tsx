import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { io } from "socket.io-client";

function QuickMatchSection() {
  const [matchLoading, setMatchLoading] = React.useState(false);
  const { toast } = useToast();
  const [matchSearchingDialog, setMatchSearchingDialog] = React.useState(false);

  const handleQuickMatch = async () => {
    try {
      setMatchLoading(true);
      const socket = io("/game");

      socket.emit("quick_match");

      socket.on("error", (error: string) => {
        throw new Error(error);
      });
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

  return (
    <TabsContent value="quick_match" className="mt-5">
      <Button size="full" variant="gameBtn" onClick={handleQuickMatch}>
        Quick Match{" "}
        {matchLoading && <Loader2 size={24} className="animate-spin" />}
      </Button>
    </TabsContent>
  );
}

export default QuickMatchSection;
