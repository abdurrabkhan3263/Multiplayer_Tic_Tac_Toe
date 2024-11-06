import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function QuickMatchSection() {
  const [matchLoading, setMatchLoading] = React.useState(false);
  const { toast } = useToast();

  const handleQuickMatch = async () => {
    try {
      setMatchLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
