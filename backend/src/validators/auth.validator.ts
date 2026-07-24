import { email, z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .min(1);

export const passwordSchema = z.string().trim().min(6);

export const registerSchema = z.object({
  name: z.string().trim().min(1),
  email: emailSchema,
  password: passwordSchema.optional(),
  avatar: z.string().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema.optional(),
  googleId: z.string().optional()
});

export const googleAuthSchema = z.object({
    email: emailSchema,
    googleId: z.string(),
    name: z.string().trim().min(1),
    avatar: z.string().optional()
})

export const googleAccessTokenSchema = z.object({
  accessToken: z.string().trim().min(1)
})

export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type googleAuthSchemaType = z.infer<typeof googleAuthSchema>
