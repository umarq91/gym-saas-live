import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac-middleware";
import { checkValidation } from "../middlewares/validation-middleware";
import { feesPaid, getGymFeesSummary, getMemberFees } from "../controllers/fees.controller";
import { FeesPaidSchema } from "../schemas/fees.schema";

export const feesRoutes = Router();

feesRoutes.get(
  "/",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  getGymFeesSummary,
);

feesRoutes.get(
  "/:memberId",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  getMemberFees,
);

feesRoutes.post(
  "/",
  authMiddleware,
  authorizeRoles("OWNER", "STAFF"),
  checkValidation(FeesPaidSchema),
  feesPaid,
);
