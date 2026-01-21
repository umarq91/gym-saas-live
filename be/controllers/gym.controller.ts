import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/api-error";
import { sendResponse } from "../utils/api-response-handler";

export const createGym = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, address } = req.body;

    const gym = await prisma.gym.create({
      data: { name, address },
    });

    return sendResponse(res, {
      statusCode: 201,
      message: "Gym created successfully",
      data: gym,
    });
  } catch (error) {
    next(error);
  }
};

export const addStaff = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, username, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ApiError("Email already exists", 400);
    }

    const hashedPass = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPass,
        username,
        gymId: req?.user.gymId,
        role: "STAFF",
      },
    });

    return sendResponse(res, {
      statusCode: 201,
      message: "A new Gym STAFF successfully created!",
    });
  } catch (error) {
    next(error);
  }
};
