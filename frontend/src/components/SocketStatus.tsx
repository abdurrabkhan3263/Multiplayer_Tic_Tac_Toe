import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/hooks/useSocket";

export const SocketStatus: React.FC = () => {
  const { socket, isConnected, reconnect } = useSocket();

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Socket Status</h2>
      <div className="flex items-center space-x-2">
        <span>Connection Status:</span>
        <Badge>{isConnected ? "Connected" : "Disconnected"}</Badge>
      </div>
      {socket && <p>Socket ID: {socket.id}</p>}
      <Button onClick={reconnect} disabled={isConnected}>
        Reconnect
      </Button>
    </div>
  );
};
