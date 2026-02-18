import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { config } from "../config/envs";
import { ApiError } from "../utils/api-error";
import { sendResponse } from "../utils/api-response-handler";
import { client } from "../utils/redis";
import { AuthenticatedRequest } from "../types/auth";

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
      { expiresIn: "7d" },
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

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const rediskey = `userId:${user.id}`;

    const cachedUser = await client.get(rediskey);
    if (cachedUser) {
      return sendResponse(res, {
        statusCode: 200,
        message: "Profile retrieved successfully",
        data: { user: JSON.parse(cachedUser) },
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        gymId: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      throw new ApiError("User not found", 404);
    }

    await client.set(rediskey, JSON.stringify(dbUser));

    return sendResponse(res, {
      statusCode: 200,
      message: "Profile retrieved successfully",
      data: { user: dbUser },
    });
  } catch (error) {
    next(error);
  }
};
