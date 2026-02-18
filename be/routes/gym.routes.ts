import { Router } from "express";
import { addStaff, createGym } from "../controllers/gym.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac-middleware";
import { checkStaffLimit } from "../middlewares/staff-limit.middleware";
import { checkValidation } from "../middlewares/validation-middleware";
import { AddStaffSchema, CreateGymSchema } from "../schemas/gym.schema";

export const gymRoutes = Router();

gymRoutes.post(
  "/",
  authMiddleware,
  authorizeRoles("SUPER__USER"),
  checkValidation(CreateGymSchema),
  createGym,
);

gymRoutes.post(
  "/add-staff",
  authMiddleware,
  authorizeRoles("OWNER"),
  checkStaffLimit,
  checkValidation(AddStaffSchema),
  addStaff,
);
