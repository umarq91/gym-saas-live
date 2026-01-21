import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";
import { sendResponse, PaginationMetadata } from "../utils/api-response-handler";

export const createMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

    return sendResponse(res, {
      statusCode: 201,
      message: "Member created successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";

    // Build where clause for searching
    const whereClause = {
      gymId: req.user!.gymId!,
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ]
        : undefined,
    };

    // Remove OR clause if no search query
    if (!search) {
      delete whereClause.OR;
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          joinDate: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.member.count({
        where: {
          gymId: req.user!.gymId!,
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }),
        },
      }),
    ]);

    return sendResponse(res, {
      statusCode: 200,
      message: "Members fetched successfully",
      data: members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
