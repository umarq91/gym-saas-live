import { Router } from "express";
import { createMember } from "../controllers/member.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac-middleware";
import { checkMemberLimit } from "../middlewares/member-limit.middleware";

export const memberRoutes = Router();

//add gym scoped middleware
memberRoutes.post(
  "/",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  checkMemberLimit,
  createMember,
);
