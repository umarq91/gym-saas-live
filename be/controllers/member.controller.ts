import { Request, Response } from "express";
import { prisma } from "../db";

export const createMember = async (req: Request, res: Response) => {
  const { name, phone, email } = req.body;

  const member = await prisma.member.create({
    data: {
      name,
      phone,
      email,
      gymId: req.user!.gymId!,
      isActive:true
    },
  });

  res.status(201).json({ success: true, data: member });
};


