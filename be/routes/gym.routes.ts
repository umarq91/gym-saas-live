import { Router } from "express";
import { createGym } from "../controllers/gym.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac-middleware";

export const gymRoutes = Router();


// ADD RBAC
gymRoutes.post(
  "/",
  authMiddleware,
  authorizeRoles("SUPER__USER"),
  createGym
);
