import z from "zod";

export const MemberSchema = z.object({
  name: z.string().min(3),
  phone: z.string().length(11, { message: "Phone number must be 11 digits" }),
  email: z.string().email().optional(),
  notes: z.string().optional(),
  emergency_contact: z
    .string()
    .length(11, { message: "Emergency contact must be 11 digits" })
    .optional(),
});

export const UpdateMemberSchema = MemberSchema.partial().extend({
  isActive: z.boolean().optional(),
});
