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
exports.createAlert = createAlert;
exports.getDeviceAlerts = getDeviceAlerts;
exports.getAlert = getAlert;
exports.resolveAlert = resolveAlert;
exports.resolveActiveAlert = resolveActiveAlert;
const alertRepository = __importStar(require("../repositories/alert.repository"));
const deviceRepository = __importStar(require("../repositories/device.repository"));
const socket_1 = require("../lib/socket");
const logger_1 = require("../lib/logger");
const app_error_1 = require("../lib/app.error");
async function createAlert(deviceId, type, severity, message) {
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
        logger_1.logger.warn("Attempted to create alert for nonexistent device", { deviceId });
        throw new app_error_1.AppError("Device not found", 404);
    }
    const activeAlert = await alertRepository.findActiveByDeviceIdAndType(deviceId, type);
    if (activeAlert) {
        if (activeAlert.severity === severity) {
            return activeAlert;
        }
        const updatedAlert = await alertRepository.updateActive(activeAlert.id, severity, message);
        if (!updatedAlert) {
            throw new Error("Failed to update alert");
        }
        const io = (0, socket_1.getIO)();
        io.to(`device:${deviceId}`).emit("alert", updatedAlert);
        logger_1.logger.info("Active alert updated", {
            deviceId,
            alertId: activeAlert.id,
            type,
            severity,
        });
        return updatedAlert;
    }
    const data = {
        deviceId,
        type,
        severity,
        message,
    };
    const alert = await alertRepository.create(data);
    const io = (0, socket_1.getIO)();
    io.to(`device:${deviceId}`).emit("alert", alert);
    logger_1.logger.info("Alert created successfully", {
        deviceId,
        alertId: alert.id,
        type,
        severity,
    });
    return alert;
}
async function getDeviceAlerts(deviceId, userId) {
    const device = await deviceRepository.findByIdAndUser(deviceId, userId);
    if (!device) {
        logger_1.logger.warn("User attempted to access alerts for an unauthorized or nonexistent device", { userId, deviceId });
        throw new app_error_1.AppError("Device not found", 404);
    }
    return alertRepository.findByDeviceId(deviceId);
}
async function getAlert(alertId, userId) {
    const alert = await alertRepository.findById(alertId);
    if (!alert) {
        throw new app_error_1.AppError("Alert not found", 404);
    }
    const device = await deviceRepository.findByIdAndUser(alert.device_id, userId);
    if (!device) {
        logger_1.logger.warn("User attempted to access an alert they do not own", {
            userId,
            alertId,
        });
        throw new app_error_1.AppError("Alert not found", 404);
    }
    return alert;
}
async function resolveAlert(alertId, userId) {
    const alert = await alertRepository.findById(alertId);
    if (!alert) {
        throw new app_error_1.AppError("Alert not found", 404);
    }
    const device = await deviceRepository.findByIdAndUser(alert.device_id, userId);
    if (!device) {
        logger_1.logger.warn("User attempted to resolve an alert they do not own", {
            userId,
            alertId,
        });
        throw new app_error_1.AppError("Alert not found", 404);
    }
    if (alert.resolved_at !== null) {
        throw new app_error_1.AppError("Alert is already resolved", 409);
    }
    const resolvedAlert = await alertRepository.resolve(alertId);
    if (!resolvedAlert) {
        throw new Error("Failed to resolve alert");
    }
    const io = (0, socket_1.getIO)();
    io.to(`device:${alert.device_id}`).emit("alert", resolvedAlert);
    logger_1.logger.info("Alert resolved successfully", {
        alertId,
        deviceId: alert.device_id,
    });
    return resolvedAlert;
}
async function resolveActiveAlert(deviceId, type) {
    const activeAlert = await alertRepository.findActiveByDeviceIdAndType(deviceId, type);
    if (!activeAlert) {
        return null;
    }
    const resolvedAlert = await alertRepository.resolve(activeAlert.id);
    if (!resolvedAlert) {
        throw new Error("Failed to resolve alert");
    }
    const io = (0, socket_1.getIO)();
    io.to(`device:${deviceId}`).emit("alert", resolvedAlert);
    logger_1.logger.info("Active alert resolved", {
        deviceId,
        alertId: activeAlert.id,
        type,
    });
    return resolvedAlert;
}
