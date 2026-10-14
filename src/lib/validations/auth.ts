import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap terlalu panjang"),

  nickname: z
    .string()
    .trim()
    .max(50, "Nama panggilan terlalu panjang")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email tidak valid"),

  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password terlalu panjang"),
  aiConsent: z.literal(true, {
    error: "Persetujuan penggunaan AI wajib disetujui.",
  }),
  privacyConsent: z.literal(true, {
    error: "Persetujuan kebijakan privasi wajib disetujui.",
  }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email tidak valid"),

  password: z
    .string()
    .min(1, "Password wajib diisi"),
});