import { Request, Response } from "express";
import { prisma } from "../db";

export const createGym = async (req: Request, res: Response) => {
  const { name, address } = req.body;

  const gym = await prisma.gym.create({
    data: { name, address },
  });

  res.status(201).json({ success: true, data: gym });
};



export const addMembers=async (req: Request, res: Response) => {

}

