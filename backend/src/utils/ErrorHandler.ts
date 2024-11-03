export class ApiError extends Error {
  status: number;
  errors: any;
  stack?: string | undefined;
  constructor({
    status,
    message = "Something went wrong",
    errors,
  }: {
    status: number;
    message?: string;
    errors?: any;
  }) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.stack = new Error().stack; // it will show the stack trace which is useful for debugging
  }
}
