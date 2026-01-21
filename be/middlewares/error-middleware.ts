import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error";

export const globalErrorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal server errorrr";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
