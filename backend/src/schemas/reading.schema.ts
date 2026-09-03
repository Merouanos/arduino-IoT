import {z} from "zod";

export const readingSchema = z.object({
    temperature: z.number().min(-273.15),
    humidity: z.number().min(0).max(100),
    free_ram: z.number().min(0),
    temperature_status: z.enum(["normal", "warning", "critical"]),
    humidity_status: z.enum(["normal", "warning", "critical"]),
});

export type ReadingInput = z.infer<typeof readingSchema>;
