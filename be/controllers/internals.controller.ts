import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../db";
import { ApiError } from "../utils/api-error";
import { sendResponse } from "../utils/api-response-handler";

export const createGymOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, username, email, password, gymId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ApiError("Email Already Exist", 400);
    }

    if (!gymId) {
      throw new ApiError("Gym Id is required", 400);
    }

    const hashedPass = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPass,
        username,
        gymId,
        role: "OWNER",
      },
    });

    return sendResponse(res, {
      statusCode: 201,
      message: "Gym Owner created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const createSaasOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, username, email, password } = req.body;

    const hashedPass = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPass,
        username,
        role: "SUPER__USER",
      },
    });

    return sendResponse(res, {
      statusCode: 201,
      message: "Saas Owner created successfully",
    });
  } catch (error) {
    next(error);
  }
};
