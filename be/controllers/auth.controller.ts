import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { config } from "../config/envs";
import { ApiError } from "../utils/api-error";
import { sendResponse } from "../utils/api-response-handler";

//todo:add zod validation

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError("Invalid email or password", 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new ApiError("Invalid email or password", 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        gymId: user.gymId,
      },
      config.jwt_secret,
      { expiresIn: "7d" }
    );

    return sendResponse(res, {
      statusCode: 200,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          gymId: user.gymId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

