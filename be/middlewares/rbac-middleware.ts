import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { UserRole } from "../types/user";

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = (req as AuthenticatedRequest).user;

    if (!roles.includes(role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    next();
  };
};
