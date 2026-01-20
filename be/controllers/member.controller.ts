import { Request, Response } from "express";
import { prisma } from "../db";

export const createMember = async (req: Request, res: Response) => {
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

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Somehting went wrong adding a member",
    });
  }
};

export const getMembers = async (req: Request, res: Response) => {
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

    res.status(200).json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch members",
    });
  }
};
