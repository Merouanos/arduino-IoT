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
exports.getStatus = void 0;
exports.startSimulation = startSimulation;
exports.stopSimulation = stopSimulation;
exports.getSimulationStatus = getSimulationStatus;
exports.setSuspended = setSuspended;
const app_error_1 = require("../lib/app.error");
const deviceRepository = __importStar(require("../repositories/device.repository"));
async function simulatorRequest(path, options = {}) {
    const simulatorUrl = process.env.SIMULATOR_INTERNAL_URL;
    const simulatorToken = process.env.SIMULATOR_CONTROL_TOKEN;
    if (!simulatorUrl ||
        !simulatorToken) {
        throw new app_error_1.AppError("Simulator is not configured", 503);
    }
    const response = await fetch(`${simulatorUrl}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-Simulator-Token": simulatorToken,
            ...(options.headers ?? {}),
        },
    });
    if (!response.ok) {
        const message = await response.text();
        throw new app_error_1.AppError(message || "Simulator request failed", 502);
    }
    return response.json();
}
async function startSimulation(deviceId, userId, scenario) {
    const device = await deviceRepository.findByIdAndUser(deviceId, userId);
    if (!device) {
        throw new app_error_1.AppError("Device not found", 404);
    }
    return simulatorRequest("/sessions/start", {
        method: "POST",
        body: JSON.stringify({
            deviceId,
            scenario,
        }),
    });
}
async function stopSimulation(deviceId, userId) {
    const device = await deviceRepository.findByIdAndUser(deviceId, userId);
    if (!device) {
        throw new app_error_1.AppError("Device not found", 404);
    }
    return simulatorRequest("/sessions/stop", {
        method: "POST",
        body: JSON.stringify({
            deviceId,
        }),
    });
}
async function getSimulationStatus(deviceId, userId) {
    const device = await deviceRepository.findByIdAndUser(deviceId, userId);
    if (!device) {
        throw new app_error_1.AppError("Device not found", 404);
    }
    return simulatorRequest(`/sessions/${deviceId}`);
}
async function setSuspended(deviceId, userId, suspended) {
    const device = await deviceRepository.findByIdAndUser(deviceId, userId);
    if (!device) {
        throw new app_error_1.AppError("Device not found", 404);
    }
    if (!suspended) {
        return startSimulation(deviceId, userId, "random");
    }
    return simulatorRequest("/sessions/suspend", {
        method: "POST",
        body: JSON.stringify({ deviceId }),
    });
}
exports.getStatus = getSimulationStatus;
