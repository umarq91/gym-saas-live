import { Router } from "express";
import { createMember } from "../controllers/member.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const memberRoutes = Router();


//add gym scoped middleware
memberRoutes.post(
  "/",
  authMiddleware,
  createMember
);
