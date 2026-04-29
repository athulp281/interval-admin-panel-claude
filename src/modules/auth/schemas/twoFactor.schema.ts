import { z } from "zod";

export const twoFactorSchema = z.object({
  code: z
    .string()
    .min(6, "Enter the 6-digit code")
    .max(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});

export type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;
