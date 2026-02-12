import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { config } from "../config/envs";
import { ApiError } from "../utils/api-error";
import { sendResponse } from "../utils/api-response-handler";
import { client } from "../utils/redis";

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
    const userId = req.user?.id;
    const rediskey = `userId:${userId}`;
    const cachedUser = await client.get(rediskey);
    if (cachedUser) {
      const user = JSON.parse(cachedUser);
      return sendResponse(res, {
        statusCode: 200,
        message: "Profile retrieved successfully",
        data: { user },
      });
    }
    if (!userId) {
      throw new ApiError("User not found", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    await client.set(rediskey, JSON.stringify(user));
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return sendResponse(res, {
      statusCode: 200,
      message: "Profile retrieved successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
