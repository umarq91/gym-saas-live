export type UserRole = "SUPER__USER" | "OWNER" | "STAFF";

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string | null;
  role: UserRole;
  gymId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
