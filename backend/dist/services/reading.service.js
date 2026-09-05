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
const readingRepository = __importStar(require("../repositories/reading.repository"));
const deviceRepository = __importStar(require("../repositories/device.repository"));
const alertService = __importStar(require("./alert.service"));
const socket_1 = require("../lib/socket");
const logger_1 = require("../lib/logger");
const app_error_1 = require("../lib/app.error");
const statusToNumber = {
    normal: 0,
    warning: 1,
    critical: 2,
};
async function createReading(deviceId, data) {
    const temperatureStatus = statusToNumber[data.temperature_status];
    const humidityStatus = statusToNumber[data.humidity_status];
    const reading = await readingRepository.create({
        deviceId,
        temperature: data.temperature,
        humidity: data.humidity,
        freeRam: data.free_ram,
        temperatureStatus,
        humidityStatus,
    });
    await processAlert(deviceId, "temperature", data.temperature_status, data.temperature);
    await processAlert(deviceId, "humidity", data.humidity_status, data.humidity);
    const lastSeen = await deviceRepository.updateLastSeen(deviceId);
    if (!lastSeen) {
        throw new Error("Failed to update device last seen");
    }
    const io = (0, socket_1.getIO)();
    io.to(`device:${deviceId}`).emit("reading", reading);
    logger_1.logger.info("Sensor reading stored successfully", {
        deviceId,
        readingId: reading.id,
    });
    return reading;
}
async function getLatestReading(deviceId, userId) {
    const device = await deviceRepository.findByIdAndUser(deviceId, userId);
    if (!device) {
        logger_1.logger.warn("User attempted to access an unauthorized or nonexistent device", { userId, deviceId });
        throw new app_error_1.AppError("Device not found", 404);
    }
    return readingRepository.findLatestByDeviceId(deviceId);
}
async function getReadingHistory(deviceId, userId) {
    const device = await deviceRepository.findByIdAndUser(deviceId, userId);
    if (!device) {
        logger_1.logger.warn("User attempted to access an unauthorized or nonexistent device", { userId, deviceId });
        throw new app_error_1.AppError("Device not found", 404);
    }
    return readingRepository.findByDeviceId(deviceId);
}
async function processAlert(deviceId, type, status, value) {
    if (status === "normal") {
        await alertService.resolveActiveAlert(deviceId, type);
        return;
    }
    const severity = status;
    await alertService.createAlert(deviceId, type, severity, `${type} is ${status}: ${value}`);
}
