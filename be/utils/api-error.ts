export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, status: number) {
    super(message);

    this.statusCode = status;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }
}
