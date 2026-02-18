import z from "zod";

export const FeesPaidSchema = z.object({
  memberId: z.string().uuid(),
  originalAmount: z.number().int().nonnegative(),
  amountPaid: z.number().int().nonnegative(),
  discountType: z.enum(["PERCENTAGE", "FLAT"]).optional(),
  discountApplied: z.string().optional(),
  type: z.string().min(1),
});
