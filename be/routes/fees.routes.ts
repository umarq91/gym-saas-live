import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac-middleware";
import { feesPaid } from "../controllers/fees.controller";

export const feesRoutes = Router();

feesRoutes.post(
  "/",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  feesPaid
);
