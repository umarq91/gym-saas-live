import { Request, Response } from "express";
import { prisma } from "../db";

export const createMember = async (req: Request, res: Response) => {
  try {
    const { name, phone, email } = req.body;

    // adding a member
    const member = await prisma.member.create({
      data: {
        name,
        phone,
        email,
        gymId: req.user!.gymId!,
        isActive: true,
      },
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Somehting went wrong adding a member",
    });
  }
};
