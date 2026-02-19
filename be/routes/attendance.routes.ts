import { Router } from "express";
import {
  addAttendance,
  getMemberAttendance,
  getMemberAttendanceSummary,
  getGymAttendanceByDate,
  deleteAttendance,
} from "../controllers/attendance.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requirePlanFeature } from "../middlewares/require-plan.middleware";
import { checkValidation } from "../middlewares/validation-middleware";
import { AddAttendanceSchema } from "../schemas/attendance.schema";

export const attendanceRoutes = Router();

attendanceRoutes.use(authMiddleware, requirePlanFeature("attendance"));

attendanceRoutes.post("/", checkValidation(AddAttendanceSchema), addAttendance);
attendanceRoutes.get("/member/:memberId/summary", getMemberAttendanceSummary);
attendanceRoutes.get("/member/:memberId", getMemberAttendance);
attendanceRoutes.get("/", getGymAttendanceByDate);
attendanceRoutes.delete("/:attendanceId", deleteAttendance);
