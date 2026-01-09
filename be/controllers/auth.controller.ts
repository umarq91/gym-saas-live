import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { config } from "../config/envs";

//todo:add zod validation

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ success: false });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ success: false });
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

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      gymId: user.gymId,
    },
  });
};

