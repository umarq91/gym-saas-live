import { Request, Response } from "express";
import { prisma } from "../db";

/**
 * MARK ATTENDANCE
 */
export const addAttendance = async (req: Request, res: Response) => {
  try {
    const { memberId, date, status } = req.body;

    if (!memberId || !date) {
      return res.json({
        success: false,
        message: "memberId and date are required",
      });
    }

    const attendanceDate = new Date(date);

    if (attendanceDate > new Date()) {
      return res.json({
        success: false,
        message: "Future dates are not allowed",
      });
    }

    const gymMember = await prisma.member.findFirst({
      where: {
        id: memberId,
        gymId: req.user!.gymId,
      },
    });

    if (!gymMember) {
      return res.json({
        success: false,
        message: "Gym member not found",
      });
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
      return res.json({
        success: false,
        message: "Attendance already marked for this date",
      });
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

    return res.json({
      success: true,
      message: "Attendance marked successfully",
    });
  } catch (error) {
    console.error("ADD ATTENDANCE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/**
 * GET MEMBER ATTENDANCE
 * /attendance/member/:memberId?from=2026-01-01&to=2026-01-31
 */
export const getMemberAttendance = async (req: Request, res: Response) => {
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
      return res.json({
        success: false,
        message: "Gym member not found",
      });
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

    return res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error("GET MEMBER ATTENDANCE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
/**
 * GET GYM ATTENDANCE BY DATE
 * /attendance?date=2026-01-19
 */
export const getGymAttendanceByDate = async (req: Request, res: Response) => {
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

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET GYM ATTENDANCE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
/**
 * UPDATE ATTENDANCE
 */
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.json({
        success: false,
        message: "status is required",
      });
    }

    const attendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        gymId: req.user!.gymId,
      },
    });

    if (!attendance) {
      return res.json({
        success: false,
        message: "Attendance record not found",
      });
    }

    await prisma.attendance.update({
      where: { id: attendanceId },
      data: { status },
    });

    return res.json({
      success: true,
      message: "Attendance updated successfully",
    });
  } catch (error) {
    console.error("UPDATE ATTENDANCE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
