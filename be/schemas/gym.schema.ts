import z from "zod";

export const CreateGymSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
});

export const AddStaffSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});
