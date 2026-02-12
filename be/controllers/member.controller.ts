import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";
import { sendResponse } from "../utils/api-response-handler";
import { client as redis, invalidateMemberCache } from "../utils/redis";

export const createMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, phone, email, notes, emergency_contact } = req.body;

    // adding a member
    const member = await prisma.member.create({
      data: {
        name,
        phone,
        email,
        gymId: req.user!.gymId!,
        isActive: true,
        notes,
        emergency_contact: emergency_contact,
      },
    });

    // Invalidate member cache for this gym
    await invalidateMemberCache(req.user!.gymId!);

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

    // Check cache
    const redisKey = `gymId:${req.user?.gymId}:members:page:${page}:limit:${limit}:search:${search}`;

    try {
      const cachedMembers = await redis.get(redisKey);
      if (cachedMembers) {
        const data = JSON.parse(cachedMembers);
        const { page, limit, total } = data.pagination;

        return sendResponse(res, {
          statusCode: 200,
          message: "Members fetched successfully (cached)",
          data: data.members,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        });
      }
    } catch (redisError) {
      console.error("Redis get error:", redisError);
      // Continue to database query if Redis fails
    }
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
        include: {
          fees: {
            take: 1,
            select: {
              paidAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
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

    // Store in cache with error handling
    try {
      const cachedDataParsing = {
        members: members,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
      await redis.set(redisKey, JSON.stringify(cachedDataParsing));
      await redis.expire(redisKey, 600); // 10 minutes
    } catch (redisError) {
      console.error("Redis set error:", redisError);
      // Continue without caching if Redis fails
    }
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

export const getMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const memberInfo = await prisma.member.findFirst({
      where: {
        id,
        gymId: req.user.gymId,
      },
    });

    sendResponse(res, {
      data: memberInfo,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const { name, phone, email, notes, emergency_contact, isActive } = req.body;

    // Ensure member belongs to the same gym
    const member = await prisma.member.findFirst({
      where: {
        id,
        gymId: req.user!.gymId!,
      },
    });

    if (!member) {
      return sendResponse(res, {
        statusCode: 404,
        message: "Member not found",
      });
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(notes !== undefined && { notes }),
        ...(emergency_contact !== undefined && {
          emergency_contact: emergency_contact,
        }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Invalidate member cache for this gym
    await invalidateMemberCache(req.user!.gymId!);

    return sendResponse(res, {
      statusCode: 200,
      message: "Member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    // Check ownership (gym scope)
    const member = await prisma.member.findFirst({
      where: {
        id,
        gymId: req.user!.gymId!,
      },
    });

    if (!member) {
      return sendResponse(res, {
        statusCode: 404,
        message: "Member not found",
      });
    }

    await prisma.member.delete({
      where: { id },
    });

    // Invalidate member cache for this gym
    await invalidateMemberCache(req.user!.gymId!);

    return sendResponse(res, {
      statusCode: 200,
      message: "Member deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
