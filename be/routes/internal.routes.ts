import { Request, Router, Response } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac-middleware";
import { checkValidation } from "../middlewares/validation-middleware";
import {
  createGymOwner,
  createSaasOwner,
} from "../controllers/internals.controller";
import { CreateGymOwnerSchema, CreateSaasOwnerSchema } from "../schemas/internal.schema";
import { sendResponse } from "../utils/api-response-handler";

export const internalRoutes = Router();

internalRoutes.post(
  "/create-owner",
  authMiddleware,
  authorizeRoles("SUPER__USER"),
  checkValidation(CreateGymOwnerSchema),
  createGymOwner,
);

internalRoutes.post(
  "/saas-owner",
  checkValidation(CreateSaasOwnerSchema),
  createSaasOwner,
);

internalRoutes.get("/health", (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    data: { running: "Yes Everything is working!" },
  });
});
