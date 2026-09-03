import { z } from "zod";

export const createDeviceSchema = z.object({
    name: z.string().min(2).max(100),
});

export const updateDeviceSchema = z.object({
    name: z.string().min(2).max(100),
});

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;