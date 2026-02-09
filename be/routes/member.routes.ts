import { Router } from "express";
import {
  createMember,
  deleteMember,
  getMember,
  getMembers,
  updateMember,
} from "../controllers/member.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac-middleware";
import { checkMemberLimit } from "../middlewares/member-limit.middleware";

export const memberRoutes = Router();

// Get all members of the gym (paginated with search)
memberRoutes.get(
  "/",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  getMembers,
);

// Create new member
memberRoutes.post(
  "/",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  checkMemberLimit,
  createMember,
);

// get a single member info
memberRoutes.get(
  "/:id",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  getMember,
);

memberRoutes.patch(
  "/:id",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  updateMember,
);

memberRoutes.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  deleteMember,
);
