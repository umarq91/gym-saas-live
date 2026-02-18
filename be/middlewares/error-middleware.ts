import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error";
import * as z from "zod";

export const globalErrorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal server errorrr";
  let errors: null | {} = null;
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (err instanceof z.ZodError) {
    message = "Type Validation Error";
    statusCode = 400;
    const formattedErrors = err.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    errors = formattedErrors;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
