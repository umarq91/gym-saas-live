import { Request, Router, Response } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/rbac-middleware";
import {
  createGymOwner,
  createSaasOwner,
} from "../controllers/internals.controller";
import { sendResponse } from "../utils/api-response-handler";
import { ApiError } from "../utils/api-error";

export const internalRoutes = Router();

internalRoutes.post(
  "/create-owner",
  authMiddleware,
  authorizeRoles("SUPER__USER"),
  createGymOwner,
);

internalRoutes.post("/saas-owner", createSaasOwner);

internalRoutes.get("/health", (req: Request, res: Response) => {
  throw new ApiError("Something is not wright", 404);
  sendResponse(res, {
    statusCode: 200,
    data: { running: "Yes Everything is working!" },
  });
});
