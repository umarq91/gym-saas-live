import * as z from "zod";


export const LoginSchema = z.object({
  email: z.string().email({ message: "This is not a valid email address." }),
  password: z.string(),
});
