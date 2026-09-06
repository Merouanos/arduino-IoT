"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const readingService = __importStar(require("../services/reading.service"));
const validate_middleware_1 = require("../middleware/validate.middleware");
const reading_schema_1 = require("../schemas/reading.schema");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const internalReadingSchema = reading_schema_1.readingSchema.extend({
    deviceId: zod_1.z.string().min(1),
});
function simulatorAuth(req, res, next) {
    const token = req.headers["x-simulator-token"];
    if (typeof token !== "string" ||
        !process.env.SIMULATOR_CONTROL_TOKEN ||
        token !==
            process.env
                .SIMULATOR_CONTROL_TOKEN) {
        return res.status(401).json({
            message: "Simulator authentication required",
        });
    }
    next();
}
router.post("/readings", simulatorAuth, (0, validate_middleware_1.validate)(internalReadingSchema), async (req, res, next) => {
    try {
        const { deviceId, temperature, humidity, free_ram, temperature_status, humidity_status, } = req.body;
        if (typeof deviceId !== "string") {
            return res.status(400).json({
                message: "deviceId is required",
            });
        }
        const reading = await readingService.createReading(deviceId, {
            temperature,
            humidity,
            free_ram,
            temperature_status,
            humidity_status,
        });
        return res.status(201).json({
            reading,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
