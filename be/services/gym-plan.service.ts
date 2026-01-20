import { GYM_PLAN_KEY, GYM_PLANS } from "../constants";
import { PrismaClient, UserRole } from "../generated/prisma/client";

export class PlanLimitService {
  constructor(private prisma: PrismaClient) {}

  async canAddMembers(
    gymId: string,
  ): Promise<{ canAdd: boolean; reason?: string }> {
    const gym = await this.prisma.gym.findFirst({
      where: {
        id: gymId,
      },
    });

    if (!gym) {
      return { canAdd: false, reason: "Gym not found!" };
    }
    
    const plan = GYM_PLANS[gym?.plan as GYM_PLAN_KEY];
    // get count of members associated with gym
    const membersCount = await this.prisma.member.count({
      where: {
        gymId: gym?.id,
      },
    });

    // compare with plans
    if (membersCount >= plan.maxMembers) {
      return {
        canAdd: false,
        reason: "Plan limit reached. You cannot add more members",
      };
    }
    return { canAdd: true };
  }

  async checkStaffLimit(
    gymId: string,
  ): Promise<{ canAdd: boolean; reason?: string }> {
    const gym = await this.prisma.gym.findFirst({
      where: {
        id: gymId,
      },
      include: {
        users: {
          where: { role: UserRole.STAFF },
        },
      },
    });

    if (!gym) {
      return { canAdd: false, reason: "Gym not found!" };
    }
    const plan = GYM_PLANS[gym?.plan as GYM_PLAN_KEY];
    const currentStaffNumber = await gym.users.length;

    if (currentStaffNumber >= plan.maxStaff) {
      return {
        canAdd: false,
        reason: `Plan Limit Reached. Maximum ${plan.maxStaff} staff members are allowed for ${gym.plan} plan`,
      };
    }

    return { canAdd: true };
  }
}
