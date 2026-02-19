import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";
import { ApiError } from "../utils/api-error";
import { sendResponse } from "../utils/api-response-handler";
import { GymRequest } from "../types/auth";

/**
 * MARK ATTENDANCE
 */
export const addAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as GymRequest;
    const { memberId, date, status } = req.body;

    const attendanceDate = new Date(date);

    if (attendanceDate > new Date()) {
      throw new ApiError("Future dates are not allowed", 400);
    }

    const gymMember = await prisma.member.findFirst({
      where: { id: memberId, gymId: user.gymId },
    });

    if (!gymMember) {
      throw new ApiError("Gym member not found", 404);
    }

    const alreadyMarked = await prisma.attendance.findFirst({
      where: { memberId, gymId: user.gymId, date: attendanceDate },
    });

    if (alreadyMarked) {
      throw new ApiError("Attendance already marked for this date", 400);
    }

    await prisma.attendance.create({
      data: {
        memberId,
        gymId: user.gymId,
        date: attendanceDate,
        status: status ?? "PRESENT",
        markedById: user.id,
      },
    });

    return sendResponse(res, {
      statusCode: 201,
      message: "Attendance marked successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET MEMBER ATTENDANCE
 * /attendance/member/:memberId?from=2026-01-01&to=2026-01-31
 */
export const getMemberAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as GymRequest;
    const { memberId } = req.params;
    const { from, to } = req.query;

    const gymMember = await prisma.member.findFirst({
      where: { id: memberId, gymId: user.gymId },
    });

    if (!gymMember) {
      throw new ApiError("Gym member not found", 404);
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        memberId,
        gymId: user.gymId,
        date: {
          gte: from ? new Date(from as string) : undefined,
          lte: to ? new Date(to as string) : undefined,
        },
      },
      include: {
        markedBy: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    });

    return sendResponse(res, {
      statusCode: 200,
      message: "Member attendance fetched successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET GYM ATTENDANCE BY DATE
 * /attendance?date=2026-01-19
 */
export const getGymAttendanceByDate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as GymRequest;
    const { date } = req.query;

    const attendanceDate = date ? new Date(date as string) : new Date();

    const data = await prisma.attendance.findMany({
      where: { gymId: user.gymId, date: attendanceDate },
      include: {
        member: { select: { id: true, name: true } },
        markedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendResponse(res, {
      statusCode: 200,
      message: "Gym attendance fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE ATTENDANCE (undo an accidental mark)
 */
export const deleteAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as GymRequest;
    const { attendanceId } = req.params;

    const attendance = await prisma.attendance.findFirst({
      where: { id: attendanceId, gymId: user.gymId },
    });

    if (!attendance) {
      throw new ApiError("Attendance record not found", 404);
    }

    await prisma.attendance.delete({ where: { id: attendanceId } });

    return sendResponse(res, {
      statusCode: 200,
      message: "Attendance record removed",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET MEMBER ATTENDANCE SUMMARY (lifetime stats since join date)
 * /attendance/member/:memberId/summary
 */
export const getMemberAttendanceSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as GymRequest;
    const { memberId } = req.params;

    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId: user.gymId },
      select: { id: true, joinDate: true },
    });

    if (!member) {
      throw new ApiError("Gym member not found", 404);
    }

    const presentCount = await prisma.attendance.count({
      where: { memberId, gymId: user.gymId, status: "PRESENT" },
    });

    // Count non-Sunday days from join date to today (inclusive)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cursor = new Date(member.joinDate);
    cursor.setHours(0, 0, 0, 0);

    let totalDays = 0;
    while (cursor <= today) {
      if (cursor.getDay() !== 0) totalDays++;
      cursor.setDate(cursor.getDate() + 1);
    }

    const rate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

    return sendResponse(res, {
      statusCode: 200,
      message: "Attendance summary fetched successfully",
      data: { presentCount, totalDays, absentCount: totalDays - presentCount, rate },
    });
  } catch (error) {
    next(error);
  }
};
