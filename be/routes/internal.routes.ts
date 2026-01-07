


import { Router } from "express";
import {  login } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac-middleware";
import { createGymOwner } from "../controllers/internals.controller";

export const internalRoutes = Router();

internalRoutes.post(
  "/create-owner",
  authMiddleware,
  authorizeRoles("SUPER__USER"),
  createGymOwner
);
