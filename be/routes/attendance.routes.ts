import { Router } from "express";
import {
  addAttendance,
  getMemberAttendance,
  getGymAttendanceByDate,
  updateAttendance,
} from "../controllers/attendance.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requirePlanFeature } from "../middlewares/require-plan.middleware";
import { checkValidation } from "../middlewares/validation-middleware";
import { AddAttendanceSchema, UpdateAttendanceSchema } from "../schemas/attendance.schema";

export const attendanceRoutes = Router();

attendanceRoutes.use(authMiddleware, requirePlanFeature("attendance"));

attendanceRoutes.post("/", checkValidation(AddAttendanceSchema), addAttendance);
attendanceRoutes.get("/member/:memberId", getMemberAttendance);
attendanceRoutes.get("/", getGymAttendanceByDate);
attendanceRoutes.patch("/:attendanceId", checkValidation(UpdateAttendanceSchema), updateAttendance);
