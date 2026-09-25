import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),

  email: z
    .string()
    .email("Invalid email address")
    .transform((value) => value.toLowerCase().trim()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .transform((value) => value.toLowerCase().trim()),

  password: z
    .string()
    .min(1, "Password is required"),
});