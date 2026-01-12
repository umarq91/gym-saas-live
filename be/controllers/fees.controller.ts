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
      return res.json({
        success: false,
        message: "Member ID is required",
      });
    }

    const fees = await prisma.fees.create({
      data: {
        takenById: req.user?.id,
        gymId: req.user?.gymId,
        memberId: memberId,
        originalAmount,
        amountPaid,
        discountType,
        discountApplied,
        type,
      },
    });

    return res.json({
      succces: true,
      message: `Fees Paid of Member ${memberId}`,
      data: fees,
    });
  } catch (error) {
    console.log("FEES ERRIR", error);
    return res.json({
      success: false,
      message: "Something went wrong",
    });
  }
}
