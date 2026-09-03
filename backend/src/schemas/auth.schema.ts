import {z} from "zod";

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(10),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(10),
});



export const updateUserSchema = z.object({
    email: z.string().email().optional(),
    currentPassword: z.string().min(8).optional(),
    newPassword: z.string().min(8).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;