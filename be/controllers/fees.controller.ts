import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";
import { ApiError } from "../utils/api-error";
import { sendResponse } from "../utils/api-response-handler";
import { GymRequest } from "../types/auth";

export async function feesPaid(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { user } = req as GymRequest;
    const { memberId, originalAmount, amountPaid, discountType, discountApplied, type } = req.body;

    if (amountPaid > originalAmount) {
      throw new ApiError("amountPaid cannot exceed originalAmount", 400);
    }

    const member = await prisma.member.findFirst({
      where: { id: memberId, gymId: user.gymId },
    });

    if (!member) {
      throw new ApiError("Member not found in this gym", 404);
    }

    const fees = await prisma.fees.create({
      data: {
        takenById: user.id,
        gymId: user.gymId,
        memberId,
        originalAmount,
        amountPaid,
        discountType,
        discountApplied,
        type,
      },
    });

    return sendResponse(res, {
      statusCode: 201,
      message: `Fees paid for member ${memberId}`,
      data: fees,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMemberFees(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { user } = req as GymRequest;
    const { memberId } = req.params;

    const fees = await prisma.fees.findMany({
      where: { gymId: user.gymId, memberId },
      include: {
        takenBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendResponse(res, {
      statusCode: 200,
      message: "Member fees fetched successfully",
      data: fees,
    });
  } catch (error) {
    next(error);
  }
}

export async function getGymFeesSummary(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { user } = req as GymRequest;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const membersData = await prisma.member.findMany({
      where: { gymId: user.gymId },
      include: {
        fees: {
          select: {
            paidAt: true,
            amountPaid: true,
            takenBy: {
              select: { id: true, name: true, role: true, createdAt: true },
            },
          },
          orderBy: { paidAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const days28 = 1000 * 60 * 60 * 24 * 28;

    const mapped = membersData.map((member) => {
      const lastFee = member.fees[0] ?? null;
      const status: "PAID" | "OVERDUE" =
        !lastFee || now.getTime() - lastFee.paidAt.getTime() > days28
          ? "OVERDUE"
          : "PAID";

      return {
        memberId: member.id,
        name: member.name,
        phone: member.phone,
        email: member.email,
        joinDate: member.joinDate,
        status,
        lastPayment: lastFee
          ? { paidAt: lastFee.paidAt, paidAmount: lastFee.amountPaid, takenBy: lastFee.takenBy }
          : null,
      };
    });

    return sendResponse(res, {
      statusCode: 200,
      message: "Gym fees summary fetched successfully",
      data: {
        overdue: mapped.filter((m) => m.status === "OVERDUE"),
        paid: mapped.filter((m) => m.status === "PAID"),
      },
      pagination: {
        page,
        limit,
        total: mapped.length,
        pages: Math.ceil(mapped.length / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}
