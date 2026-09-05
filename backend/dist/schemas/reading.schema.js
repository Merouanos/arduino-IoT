"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readingSchema = void 0;
const zod_1 = require("zod");
exports.readingSchema = zod_1.z.object({
    temperature: zod_1.z.number().min(-273.15),
    humidity: zod_1.z.number().min(0).max(100),
    free_ram: zod_1.z.number().min(0),
    temperature_status: zod_1.z.enum(["normal", "warning", "critical"]),
    humidity_status: zod_1.z.enum(["normal", "warning", "critical"]),
});
