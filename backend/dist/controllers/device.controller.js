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
exports.createDevice = createDevice;
exports.getUserDevices = getUserDevices;
exports.getDevice = getDevice;
exports.updateDevice = updateDevice;
exports.deleteDevice = deleteDevice;
exports.regenerateDeviceKey = regenerateDeviceKey;
const deviceService = __importStar(require("../services/device.service"));
async function createDevice(req, res, next) {
    try {
        const userId = req.user.id;
        const { name } = req.body;
        const result = await deviceService.createDevice(userId, name);
        return res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
}
async function getUserDevices(req, res, next) {
    try {
        const userId = req.user.id;
        const devices = await deviceService.getUserDevices(userId);
        return res.status(200).json({
            devices,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getDevice(req, res, next) {
    try {
        const { id: deviceId } = req.params;
        if (typeof deviceId !== "string") {
            return res.status(400).json({
                message: "Invalid device ID",
            });
        }
        const userId = req.user.id;
        const device = await deviceService.getDevice(deviceId, userId);
        return res.status(200).json({
            device,
        });
    }
    catch (error) {
        next(error);
    }
}
async function updateDevice(req, res, next) {
    try {
        const { id: deviceId } = req.params;
        if (typeof deviceId !== "string") {
            return res.status(400).json({
                message: "Invalid device ID",
            });
        }
        const userId = req.user.id;
        const { name } = req.body;
        const device = await deviceService.updateDevice(deviceId, userId, name);
        return res.status(200).json({
            device,
        });
    }
    catch (error) {
        next(error);
    }
}
async function deleteDevice(req, res, next) {
    try {
        const { id: deviceId } = req.params;
        if (typeof deviceId !== "string") {
            return res.status(400).json({
                message: "Invalid device ID",
            });
        }
        const userId = req.user.id;
        const result = await deviceService.deleteDevice(deviceId, userId);
        return res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
async function regenerateDeviceKey(req, res, next) {
    try {
        const { id: deviceId } = req.params;
        if (typeof deviceId !== "string") {
            return res.status(400).json({
                message: "Invalid device ID",
            });
        }
        const userId = req.user.id;
        const result = await deviceService.regenerateDeviceKey(deviceId, userId);
        return res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
