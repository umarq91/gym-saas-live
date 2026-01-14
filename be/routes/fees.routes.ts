import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac-middleware";
import { feesPaid, getGymFeesSummary, getMemberFees } from "../controllers/fees.controller";

export const feesRoutes = Router();

feesRoutes.get(
  "/:memberId",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  getMemberFees
);

feesRoutes.get(
  "/",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  getGymFeesSummary
);

feesRoutes.post(
  "/",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  feesPaid
);
