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
exports.createReading = createReading;
exports.getLatestReading = getLatestReading;
exports.getReadingHistory = getReadingHistory;
const readingService = __importStar(require("../services/reading.service"));
async function createReading(req, res, next) {
    try {
        const deviceId = req.device.id;
        const data = req.body;
        const reading = await readingService.createReading(deviceId, data);
        return res.status(201).json({
            reading,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getLatestReading(req, res, next) {
    try {
        const { id: deviceId } = req.params;
        if (typeof deviceId !== "string") {
            return res.status(400).json({
                message: "Invalid device ID",
            });
        }
        const userId = req.user.id;
        const reading = await readingService.getLatestReading(deviceId, userId);
        return res.status(200).json({
            reading,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getReadingHistory(req, res, next) {
    try {
        const { id: deviceId } = req.params;
        if (typeof deviceId !== "string") {
            return res.status(400).json({
                message: "Invalid device ID",
            });
        }
        const userId = req.user.id;
        const readings = await readingService.getReadingHistory(deviceId, userId);
        return res.status(200).json({
            readings,
        });
    }
    catch (error) {
        next(error);
    }
}
