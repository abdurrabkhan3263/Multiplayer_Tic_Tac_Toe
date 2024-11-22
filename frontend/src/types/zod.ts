import { z } from "zod";

export const roomObj = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(3, { message: "Name must be at least 3 characters" }),
  password: z.union([
    z.string().min(6, { message: "Password must be at least 6 characters" }),
    z.string().length(0),
  ]),
});
