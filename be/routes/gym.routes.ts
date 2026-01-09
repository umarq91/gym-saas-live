import { Router } from "express";
import { addStaff, createGym } from "../controllers/gym.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac-middleware";

export const gymRoutes = Router();

// ADD RBAC
gymRoutes.post("/", authMiddleware, authorizeRoles("SUPER__USER"), createGym);

gymRoutes.post("/add-staff", authMiddleware, authorizeRoles("OWNER"), addStaff);
