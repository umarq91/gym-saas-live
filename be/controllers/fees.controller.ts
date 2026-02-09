import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";
import { ApiError } from "../utils/api-error";
import {
  sendResponse,
  PaginationMetadata,
} from "../utils/api-response-handler";

export async function feesPaid(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      memberId,
      originalAmount,
      amountPaid,
      discountType,
      discountApplied,
      type,
    } = req.body;

    if (!memberId) {
      throw new ApiError("Member ID is required", 400);
    }

    if (originalAmount < 0 || amountPaid < 0 || amountPaid > originalAmount) {
      throw new ApiError("Invalid fee amounts", 400);
    }

    // ensure member belongs to same gym
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        gymId: req.user!.gymId,
      },
    });

    if (!member) {
      throw new ApiError("Member not found in this gym", 404);
    }

    const fees = await prisma.fees.create({
      data: {
        takenById: req.user!.id,
        gymId: req.user!.gymId,
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
    const { memberId } = req.params;

    if (!memberId) {
      throw new ApiError("Member ID is required", 400);
    }

    const fees = await prisma.fees.findMany({
      where: {
        gymId: req.user!.gymId,
        memberId,
      },
      include: {
        takenBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
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
  console.log("request",req);
  
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    // we're only getting those who have paid fees
    // const feesSummary = await prisma.fees.findMany({
    //   where: {
    //     gymId: req.user!.gymId,
    //   },
    //   skip,
    //   take: limit,
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    //   include: {
    //     member: {
    //       select: {
    //         id: true,
    //         name: true,
    //         phone: true,
    //       },
    //     },
    //     takenBy: {
    //       select: {
    //         id: true,
    //         name: true,
    //         role: true,
    //         createdAt: true,
    //       },
    //     },
    //   },
    // });
    // we need the members who have not paid or overdue for the last 28 days

    const membersData = await prisma.member.findMany({
      where: {
        gymId: req.user!.gymId,
      },
      include: {
        fees: {
          select: {
            paidAt: true,
            amountPaid: true,
            takenBy: {
              select: {
                id: true,
                name: true,
                role: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            paidAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const now = new Date();
    const mapped = membersData.map((member) => {
      const lastFees = member.fees[0] ?? null;
      let status: "PAID" | "OVERDUE";

      // If not available -> overdue
      if (!lastFees) {
        status = "OVERDUE";
      } else {
        //else -> check if that's over last 28 days -> if yes -> overdue
        const sinceLastPayment = now.getTime() - lastFees.paidAt.getTime();
        const days_28 = 1000 * 60 * 60 * 24 * 28;
        
        status = sinceLastPayment > days_28 ? "OVERDUE" : "PAID";
      }

      return {
        memberId: member.id,
        name: member.name,
        phone: member.phone,
        email: member.email,
        joinDate: member.joinDate,
        status,
        lastPayment: lastFees
          ? {
              paidAt: lastFees.paidAt,
              paidAmount: lastFees.amountPaid,
              takenBy: lastFees.takenBy,
            }
          : null,
      };
    });

    const summary = {
      overdue: mapped.filter((m) => m.status === "OVERDUE"),
      paid: mapped.filter((m) => m.status === "PAID"),
    };
    return sendResponse(res, {
      statusCode: 200,
      message: "Gym fees summary fetched successfully",
      data: summary,
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
