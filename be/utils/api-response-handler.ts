import { Response } from "express";

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface apiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMetadata;
}

export const sendResponse = <T>(
  res: Response,
  options: {
    statusCode?: number;
    message?: string;
    data?: T;
    pagination?: PaginationMetadata;
  },
) => {
  const { statusCode = 201, message = "Successs", data, pagination } = options;
  const response: apiResponse = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
  };
  return res.status(statusCode).json(response);
};
