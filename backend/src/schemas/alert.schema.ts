import { z } from "zod";

export const createAlertSchema = z.object({
    type: z.string().min(1),
    severity: z.string().min(1),
    message: z.string().min(1),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;