"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeviceSchema = exports.createDeviceSchema = void 0;
const zod_1 = require("zod");
exports.createDeviceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
});
exports.updateDeviceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
});
