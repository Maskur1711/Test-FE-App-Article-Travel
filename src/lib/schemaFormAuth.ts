import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(3, "Wajib diisi"),
  password: z.string().min(8, "Minimal 8 karakter"),
});

export const registerSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  username: z.string().min(3, "Minimal 3 karakter"),
  password: z.string().min(8, "Minimal 8 karakter"),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
