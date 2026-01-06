import { UserRole } from "./user";

export interface AuthUser {
  id: string;
  role: UserRole;
  gymId: string | null;
}