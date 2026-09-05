"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAlertSchema = void 0;
const zod_1 = require("zod");
exports.createAlertSchema = zod_1.z.object({
    type: zod_1.z.string().min(1),
    severity: zod_1.z.string().min(1),
    message: zod_1.z.string().min(1),
});
