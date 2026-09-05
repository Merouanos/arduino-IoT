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
exports.getStatus = getStatus;
exports.setSuspended = setSuspended;
const app_error_1 = require("../lib/app.error");
const deviceRepository = __importStar(require("../repositories/device.repository"));
const simulatorUrl = process.env.SIMULATOR_URL ?? "http://simulator:4000";
const simulatorToken = process.env.SIMULATOR_CONTROL_TOKEN;
async function requestSimulator(path) {
    if (!simulatorToken) {
        throw new app_error_1.AppError("Simulator control is not configured", 503);
    }
    try {
        const response = await fetch(`${simulatorUrl}${path}`, {
            method: path === "/status" ? "GET" : "POST",
            headers: {
                "X-Simulator-Token": simulatorToken,
            },
        });
        if (!response.ok) {
            throw new app_error_1.AppError("Simulator control unavailable", 503);
        }
        return (await response.json());
    }
    catch (error) {
        if (error instanceof app_error_1.AppError) {
            throw error;
        }
        throw new app_error_1.AppError("Simulator control unavailable", 503);
    }
}
async function assertSimulatorDevice(deviceId, userId) {
    const device = await deviceRepository.findByIdAndUser(deviceId, userId);
    if (!device) {
        throw new app_error_1.AppError("Device not found", 404);
    }
    if (process.env.SIMULATOR_DEVICE_ID !== deviceId) {
        throw new app_error_1.AppError("Simulator is not assigned to this device", 409);
    }
}
async function getStatus(deviceId, userId) {
    await assertSimulatorDevice(deviceId, userId);
    return requestSimulator("/status");
}
async function setSuspended(deviceId, userId, suspended) {
    await assertSimulatorDevice(deviceId, userId);
    return requestSimulator(suspended ? "/pause" : "/resume");
}
