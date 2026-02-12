import { Router } from "express";
import { login, getProfile } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.get("/profile", authMiddleware, getProfile);

