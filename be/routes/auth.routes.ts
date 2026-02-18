import { Router } from "express";
import { login, getProfile } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { checkValidation } from "../middlewares/validation-middleware";
import { LoginSchema } from "../schemas/auth.schema";

export const authRoutes = Router();

authRoutes.post("/login", checkValidation(LoginSchema), login);
authRoutes.get("/profile", authMiddleware, getProfile);
