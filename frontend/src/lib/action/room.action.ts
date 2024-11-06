import axios, { AxiosError } from "axios";

export async function getAllRoom() {
  try {
    const response = await axios.get("/api/room");

    if (response.status !== 200) {
      throw new Error(response?.data?.message);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getMyRoom({ userId }: { userId: string }) {
  try {
    const response = await axios.get(`/api/room/${userId}`);

    if (response.status !== 200) {
      throw new Error(response?.data?.message);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
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
      name,
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
