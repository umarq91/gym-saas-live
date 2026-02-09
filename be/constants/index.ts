import { GYMPLANS } from "../generated/prisma/enums";

export const GYM_PLANS = {
  FREE: {
    attendance: true,
    maxMembers: 50,
    maxStaff: 11,
    reports: false,
  },
  BASIC: {
    attendance: true,
    maxMembers: 100,
    maxStaff: 5,
    reports: true,
  },
  PRO: {
    attendance: true,
    maxMembers: 300,
    maxStaff: Infinity,
    reports: true,
  },
} as const;

export type GYM_PLAN_KEY = keyof typeof GYMPLANS;
