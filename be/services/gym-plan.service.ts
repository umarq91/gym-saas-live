import { PrismaClient, UserRole } from "../generated/prisma/client";
import { GYM_PLANS, GYM_PLAN_KEY } from "../constants";

export class PlanLimitService {
  constructor(private prisma: PrismaClient) {}

  private async getGymPlan(gymId: string) {
    const gym = await this.prisma.gym.findUnique({
      where: { id: gymId },
      select: { id: true, plan: true },
    });

    if (!gym) {
      throw new Error("Gym not found");
    }

    return {
      gymId: gym.id,
      planKey: gym.plan as GYM_PLAN_KEY,
      plan: GYM_PLANS[gym.plan as GYM_PLAN_KEY],
    };
  }

  async canAddMembers(
    gymId: string,
  ): Promise<{ canAdd: boolean; reason?: string }> {
    const { plan, planKey } = await this.getGymPlan(gymId);

    const membersCount = await this.prisma.member.count({
      where: { gymId },
    });

    if (membersCount >= plan.maxMembers) {
      return {
        canAdd: false,
        reason: `Member limit reached for ${planKey} plan`,
      };
    }

    return { canAdd: true };
  }

  async canAddStaff(
    gymId: string,
  ): Promise<{ canAdd: boolean; reason?: string }> {
    const { plan, planKey } = await this.getGymPlan(gymId);

    const staffCount = await this.prisma.user.count({
      where: {
        gymId,
        role: UserRole.STAFF,
      },
    });

    if (staffCount >= plan.maxStaff) {
      return {
        canAdd: false,
        reason: `Staff limit reached for ${planKey} plan`,
      };
    }

    return { canAdd: true };
  }

  async hasFeature(
    gymId: string,
    feature: keyof (typeof GYM_PLANS)[GYM_PLAN_KEY],
  ): Promise<boolean> {
    const { plan } = await this.getGymPlan(gymId);
    return Boolean(plan[feature]);
  }
}
