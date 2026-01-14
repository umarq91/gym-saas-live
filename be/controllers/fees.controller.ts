import { Request, Response } from "express";
import { prisma } from "../db";

export async function feesPaid(req: Request, res: Response) {
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
      return res.status(400).json({
        success: false,
        message: "Member ID is required",
      });
    }

    if (originalAmount < 0 || amountPaid < 0 || amountPaid > originalAmount) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee amounts",
      });
    }

    // ensure member belongs to same gym
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        gymId: req.user!.gymId,
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found in this gym",
      });
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

    return res.status(201).json({
      success: true,
      message: `Fees paid for member ${memberId}`,
      data: fees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to record fees",
    });
  }
}

export async function getMemberFees(req: Request, res: Response) {
  try {
    const { memberId } = req.params;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required",
      });
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

    return res.json({
      success: true,
      data: fees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch member fees",
    });
  }
}

export async function getGymFeesSummary(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const feesSummary = await prisma.fees.findMany({
      where: {
        gymId: req.user!.gymId,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        takenBy: {
          select: {
            id: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      page,
      limit,
      data: feesSummary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch gym fees summary",
    });
  }
}
