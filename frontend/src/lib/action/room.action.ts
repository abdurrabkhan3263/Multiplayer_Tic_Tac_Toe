import axios, { AxiosError } from "axios";

export async function getAllRoom() {
  const response = await axios.get("/api/room");

  if (response.status !== 200) {
    throw new Error(response?.data?.message);
  }

  return response.data;
}

export async function getMyRoom({ userId }: { userId: string }) {
  const response = await axios.get(`/api/room/${userId}`);

  if (response.status !== 200) {
    throw new Error(response?.data?.message);
  }

  return response.data;
}

export async function addNewRoom({
  name,
  password,
  userId,
}: {
  name: string;
  password: string;
  userId: string;
}) {
  try {
    const response = await axios.post("/api/room/create", {
      roomName: name,
      password,
      userId,
    });

    if (response.status !== 200) {
      throw new Error(response?.data?.message);
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;

    throw axiosError.response?.data || axiosError;
  }
}

export async function getRoomById({ roomId }: { roomId: string }) {
  try {
    if (!roomId) {
      throw new Error("Room Id is required");
    }
    const response = await axios.get(`/api/room/get-room-by-id/${roomId}`);

    if (response.status !== 200) {
      throw new Error(response?.data?.message);
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;

    throw axiosError.response?.data || axiosError;
  }
}
