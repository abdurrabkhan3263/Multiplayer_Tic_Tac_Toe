import { Response as ResponseType } from "../types";

export class ResponseHandler {
  statusCode: number;
  message: string;
  data?: any;
  status: string;

  public constructor({ statusCode, message, data }: ResponseType) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data ?? null;
    this.status = statusCode < 400 ? "success" : "error";
  }
}

export default ResponseHandler;
