import { NextFunction, Request, Response } from "express";
import { PlanLimitService } from "../services/gym-plan.service";
import { prisma } from "../db";

const planService = new PlanLimitService(prisma);

export const requirePlanFeature = (feature: "attendance" | "reports") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const gymId = req.user?.gymId;
    if (!gymId) return res.status(400).json({ success: false });

    const allowed = await planService.hasFeature(gymId, feature);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: `${feature} is not available on your plan`,
      });
    }

    next();
  };
};
