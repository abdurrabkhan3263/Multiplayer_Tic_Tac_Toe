import OfflineTic from "@/components/Game/OfflineTic";
import OnlineTic from "@/components/Game/OnlineTic";
import RoomProvider, { useRoomContext } from "@/context/RoomContext";
import { useToast } from "@/hooks/use-toast";
import { getRoomById } from "@/lib/action/room.action";
import { DB_NAME } from "@/lib/constants";
import { User } from "@/types";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Play() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const dbRef = useRef<IDBDatabase | null>(null);
  const navigate = useNavigate();
  const { setRoomId, setUser, setRoomName } = useRoomContext();

  useEffect(() => {
    const request = indexedDB.open(DB_NAME, 3);

    request.onsuccess = async () => {
      dbRef.current = request.result;
      const transaction = dbRef.current.transaction("currentUser", "readonly");
      const store = transaction.objectStore("currentUser");

      store.getAll().onsuccess = async (event) => {
        const users = (event.target as IDBRequest).result as User[];
        setCurrentUser(users[0]);

        if (!users[0]) {
          toast({
            title: "Error",
            description: "You need to login first",
            variant: "destructive",
          });
          navigate("/home");
        }
      };
    };

    return () => {
      if (dbRef.current) {
        dbRef.current.close();
      }
    };
  }, [navigate, toast]);

  useEffect(() => {
    (async () => {
      if (currentUser) {
        setUser(currentUser);
      }
      const roomId = window.location.pathname.split("/").pop();
      try {
        const findRoom = await getRoomById({ roomId: roomId ?? "" });

        if (roomId) {
          setRoomId(findRoom.roomId);
          setRoomName(findRoom.roomName);
        } else {
          navigate("/home");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: (error as Error)?.message ?? "Something went wrong",
          variant: "destructive",
        });
        navigate("/home");
      }

      return () => {
        if (dbRef.current) {
          dbRef.current.close();
        }
      };
    })();
  }, [currentUser, navigate, setRoomId, setRoomName, setUser, toast]);

  return (
    <RoomProvider>
      params?.roomId ? <OnlineTic user={currentUser} /> : <OfflineTic />
    </RoomProvider>
  );
}

export default Play;
