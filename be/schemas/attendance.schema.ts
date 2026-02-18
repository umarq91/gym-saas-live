import z from "zod";

export const AddAttendanceSchema = z.object({
  memberId: z.string().uuid(),
  date: z.string().date(),
  status: z.enum(["PRESENT", "ABSENT"]).optional(),
});

export const UpdateAttendanceSchema = z.object({
  status: z.enum(["PRESENT", "ABSENT"]),
});
