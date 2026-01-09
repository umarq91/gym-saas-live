import { Request, Response } from "express";
import { prisma } from "../db";
import bcrypt from "bcrypt";

export const createGym = async (req: Request, res: Response) => {
  const { name, address } = req.body;

  const gym = await prisma.gym.create({
    data: { name, address },
  });

  res.status(201).json({ success: true, data: gym });
};

export const addStaff = async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return res.status(400).json({
      sucess: false,
      message: "Email already exists",
    });
  }

  const hashedPass = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPass,
      username,
      gymId:req?.user.gymId,
      role:"STAFF"
    },
  });

  return res.status(201).json({
    success: true,
    message: "A new Gym STAFF sccessfully created!",
  });
};
