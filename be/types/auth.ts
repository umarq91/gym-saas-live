import { Request } from "express";
import { UserRole } from "./user";

export interface AuthUser {
  id: string;
  role: UserRole;
  gymId: string | null;
}

/** Use in controllers behind authMiddleware — user is always present */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

/** Use in controllers behind authorizeRoles("OWNER", "STAFF") — gymId is always a string */
export interface GymRequest extends Request {
  user: Omit<AuthUser, "gymId"> & { gymId: string };
}
