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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDevice = createDevice;
exports.getUserDevices = getUserDevices;
exports.getDevice = getDevice;
exports.updateDevice = updateDevice;
exports.deleteDevice = deleteDevice;
exports.regenerateDeviceKey = regenerateDeviceKey;
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const deviceRepository = __importStar(require("../repositories/device.repository"));
const logger_1 = require("../lib/logger");
const app_error_1 = require("../lib/app.error");
async function createDevice(userId, name) {
    const deviceKey = crypto_1.default.randomBytes(32).toString("hex");
    const deviceKeyHash = await bcrypt_1.default.hash(deviceKey, 12);
    const deviceData = {
        userId,
        name,
        deviceKeyHash,
    };
    const device = await deviceRepository.create(deviceData);
    logger_1.logger.info("Device created successfully", device.id);
    return {
        device: {
            id: device.id,
            userId: device.user_id,
            name: device.name,
            createdAt: device.created_at,
            lastSeenAt: device.last_seen_at,
        },
        deviceKey,
    };
}
async function getUserDevices(userId) {
    const devices = await deviceRepository.findByUserId(userId);
    logger_1.logger.info("User devices retrieved", userId);
    return devices.map((device) => ({
        id: device.id,
        name: device.name,
        createdAt: device.created_at,
        lastSeenAt: device.last_seen_at,
    }));
}
async function getDevice(deviceId, userId) {
    const device = await deviceRepository.findByIdAndUser(deviceId, userId);
    if (!device) {
        logger_1.logger.warn("User attempted to access a device they do not own", { userId, deviceId });
        throw new app_error_1.AppError("Device not found", 404);
    }
    return {
        id: device.id,
        name: device.name,
        createdAt: device.created_at,
        lastSeenAt: device.last_seen_at,
    };
}
async function updateDevice(deviceId, userId, name) {
    const device = await deviceRepository.findByIdAndUser(deviceId, userId);
    if (!device) {
        logger_1.logger.warn("User attempted to update a device they do not own", { userId, deviceId });
        throw new app_error_1.AppError("Device not found", 404);
    }
    const updateData = {
        name,
    };
    const updatedDevice = await deviceRepository.update(deviceId, updateData);
    if (!updatedDevice) {
        throw new Error("Failed to update device");
    }
    logger_1.logger.info("Device updated successfully", deviceId);
    return {
        id: updatedDevice.id,
        name: updatedDevice.name,
        createdAt: updatedDevice.created_at,
        lastSeenAt: updatedDevice.last_seen_at,
    };
}
async function deleteDevice(deviceId, userId) {
    const device = await deviceRepository.findByIdAndUser(deviceId, userId);
    if (!device) {
        logger_1.logger.warn("User attempted to delete a device they do not own", { userId, deviceId });
        throw new app_error_1.AppError("Device not found", 404);
    }
    const deletedDevice = await deviceRepository.deleteById(deviceId);
    if (!deletedDevice) {
        throw new Error("Failed to delete device");
    }
    logger_1.logger.info("Device deleted successfully", deviceId);
    return {
        id: deletedDevice.id,
    };
}
async function regenerateDeviceKey(deviceId, userId) {
    const device = await deviceRepository.findByIdAndUser(deviceId, userId);
    if (!device) {
        logger_1.logger.warn("User attempted to regenerate a key for a device they do not own", { userId, deviceId });
        throw new app_error_1.AppError("Device not found", 404);
    }
    const deviceKey = crypto_1.default.randomBytes(32).toString("hex");
    const deviceKeyHash = await bcrypt_1.default.hash(deviceKey, 12);
    const updatedDevice = await deviceRepository.updateKeyHash(deviceId, deviceKeyHash);
    if (!updatedDevice) {
        throw new Error("Failed to regenerate device key");
    }
    logger_1.logger.info("Device key regenerated successfully", deviceId);
    return {
        deviceId,
        deviceKey,
    };
}
