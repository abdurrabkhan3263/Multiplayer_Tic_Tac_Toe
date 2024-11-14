import axios from "axios";

export const addUser = async ({
  userName,
  userId,
}: {
  userName: string;
  userId?: string;
}) => {
  const response = await axios.post(`/api/user`, { userName, userId });

  if (response.statusText !== "OK") {
    throw new Error(response.data?.message || "Failed to add user");
  }
  return response.data;
};

export const getUser = async ({ userId }: { userId: string }) => {
  const response = await axios.get(`/api/user/${userId}`);

  if (response.status !== 200) {
    throw new Error(response.data?.message || "Failed to get user");
  }
  return response.data;
};

export const updateUser = async ({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) => {
  const response = await axios.put(`/api/user/${userId}`, { userName });

  if (response.statusText !== "OK") {
    throw new Error(response.data?.message || "Failed to update user");
  }
  return response.data;
};
