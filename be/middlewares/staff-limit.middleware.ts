import { NextFunction, Request, Response } from "express";
import { PlanLimitService } from "../services/gym-plan.service";
import { prisma } from "../db";

const planService = new PlanLimitService(prisma);

export const checkStaffLimit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const gymId = req.user?.gymId;
  if (!gymId) {
    return res.json({
      status: false,
      message: "Gym id is required.",
    });
  }

  const canAdd = await planService.canAddStaff(gymId);

  if (!canAdd.canAdd) {
    return res.status(403).json({
      status: false,
      message: canAdd.reason,
    });
  }
  next();
};
