


import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac-middleware";
import { createGymOwner, createSaasOwner } from "../controllers/internals.controller";

export const internalRoutes = Router();

internalRoutes.post(
  "/create-owner",
  authMiddleware,
  authorizeRoles("SUPER__USER"),
  createGymOwner
);


internalRoutes.post(
  "/saas-owner",
  createSaasOwner
);
