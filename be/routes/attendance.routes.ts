import { Router } from "express";
import {
  addAttendance,
  getMemberAttendance,
  getGymAttendanceByDate,
  updateAttendance,
} from "../controllers/attendance.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requirePlanFeature } from "../middlewares/require-plan.middleware";

export const attendanceRoutes = Router();

attendanceRoutes.use(authMiddleware, requirePlanFeature("attendance"));

attendanceRoutes.post("/", authMiddleware, addAttendance);
attendanceRoutes.get("/member/:memberId", authMiddleware, getMemberAttendance);
attendanceRoutes.get("/", authMiddleware, getGymAttendanceByDate);
attendanceRoutes.patch("/:attendanceId", authMiddleware, updateAttendance);
