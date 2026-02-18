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
import { checkValidation } from "../middlewares/validation-middleware";
import { MemberSchema, UpdateMemberSchema } from "../schemas/member.schema";

export const memberRoutes = Router();

memberRoutes.get(
  "/",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  getMembers,
);

memberRoutes.post(
  "/",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  checkMemberLimit,
  checkValidation(MemberSchema),
  createMember,
);

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
  checkValidation(UpdateMemberSchema),
  updateMember,
);

memberRoutes.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  deleteMember,
);
