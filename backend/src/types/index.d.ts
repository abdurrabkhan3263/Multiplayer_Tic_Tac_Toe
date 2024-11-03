export declare type Response = {
  statusCode: number;
  message: string;
  data?: any;
};

export declare type CreateRoom = {
  userId: string;
  name: string;
  password: string;
};
