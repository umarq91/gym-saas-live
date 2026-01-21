import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";
import { ApiError } from "../utils/api-error";
import { sendResponse } from "../utils/api-response-handler";

/**
 * MARK ATTENDANCE
 */
export const addAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { memberId, date, status } = req.body;

    if (!memberId || !date) {
      throw new ApiError("memberId and date are required", 400);
    }

    const attendanceDate = new Date(date);

    if (attendanceDate > new Date()) {
      throw new ApiError("Future dates are not allowed", 400);
    }

    const gymMember = await prisma.member.findFirst({
      where: {
        id: memberId,
        gymId: req.user!.gymId,
      },
    });

    if (!gymMember) {
      throw new ApiError("Gym member not found", 404);
    }

    // Prevent duplicate attendance
    const alreadyMarked = await prisma.attendance.findFirst({
      where: {
        memberId,
        gymId: req.user!.gymId,
        date: attendanceDate,
      },
    });

    if (alreadyMarked) {
      throw new ApiError("Attendance already marked for this date", 400);
    }

    await prisma.attendance.create({
      data: {
        memberId,
        gymId: req.user!.gymId,
        date: attendanceDate,
        status: status ?? "PRESENT",
        markedById: req.user!.id,
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
    const { memberId } = req.params;
    const { from, to } = req.query;

    // Ensure member belongs to same gym
    const gymMember = await prisma.member.findFirst({
      where: {
        id: memberId,
        gymId: req.user!.gymId,
      },
    });

    if (!gymMember) {
      throw new ApiError("Gym member not found", 404);
    }

    const attendance = await prisma.attendance.findMany({
      where: {
        memberId,
        gymId: req.user!.gymId,
        date: {
          gte: from ? new Date(from as string) : undefined,
          lte: to ? new Date(to as string) : undefined,
        },
      },
      orderBy: {
        date: "desc",
      },
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
    const { date } = req.query;

    const attendanceDate = date ? new Date(date as string) : new Date();

    const data = await prisma.attendance.findMany({
      where: {
        gymId: req.user!.gymId,
        date: attendanceDate,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
          },
        },
        markedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
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
 * UPDATE ATTENDANCE
 */
export const updateAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ApiError("status is required", 400);
    }

    const attendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        gymId: req.user!.gymId,
      },
    });

    if (!attendance) {
      throw new ApiError("Attendance record not found", 404);
    }

    await prisma.attendance.update({
      where: { id: attendanceId },
      data: { status },
    });

    return sendResponse(res, {
      statusCode: 200,
      message: "Attendance updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
