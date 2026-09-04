import * as alertRepository from "../repositories/alert.repository";
import * as deviceRepository from "../repositories/device.repository";
import { logger } from "../lib/logger";
import { AppError } from "../lib/app.error";

export async function createAlert(
    deviceId: string,
    type: string,
    severity: string,
    message: string
) {
    const device = await deviceRepository.findById(
        deviceId
    );

    if (!device) {
        logger.warn(
            "Attempted to create alert for nonexistent device",
            { deviceId }
        );

        throw new AppError(
            "Device not found",
            404
        );
    }

    const activeAlert =
        await alertRepository.findActiveByDeviceIdAndType(
            deviceId,
            type
        );

    if (activeAlert) {
        logger.info(
            "Active alert already exists for device",
            {
                deviceId,
                alertId: activeAlert.id,
                type: activeAlert.type,
            }
        );

        return activeAlert;
    }

    const data: alertRepository.CreateAlertData = {
        deviceId,
        type,
        severity,
        message,
    };

    const alert =
        await alertRepository.create(data);

    logger.info(
        "Alert created successfully",
        {
            deviceId,
            alertId: alert.id,
            type,
            severity,
        }
    );

    return alert;
}

export async function getDeviceAlerts(
    deviceId: string,
    userId: string
) {
    const device =
        await deviceRepository.findByIdAndUser(
            deviceId,
            userId
        );

    if (!device) {
        logger.warn(
            "User attempted to access alerts for an unauthorized or nonexistent device",
            { userId, deviceId }
        );

        throw new AppError(
            "Device not found",
            404
        );
    }

    return alertRepository.findByDeviceId(
        deviceId
    );
}

export async function getAlert(
    alertId: string,
    userId: string
) {
    const alert =
        await alertRepository.findById(alertId);

    if (!alert) {
        throw new AppError(
            "Alert not found",
            404
        );
    }

    const device =
        await deviceRepository.findByIdAndUser(
            alert.device_id,
            userId
        );

    if (!device) {
        logger.warn(
            "User attempted to access an alert they do not own",
            {
                userId,
                alertId,
            }
        );

        throw new AppError(
            "Alert not found",
            404
        );
    }

    return alert;
}

export async function resolveAlert(
    alertId: string,
    userId: string
) {
    const alert =
        await alertRepository.findById(alertId);

    if (!alert) {
        throw new AppError(
            "Alert not found",
            404
        );
    }

    const device =
        await deviceRepository.findByIdAndUser(
            alert.device_id,
            userId
        );

    if (!device) {
        logger.warn(
            "User attempted to resolve an alert they do not own",
            {
                userId,
                alertId,
            }
        );

        throw new AppError(
            "Alert not found",
            404
        );
    }

    if (alert.resolved_at !== null) {
        throw new AppError(
            "Alert is already resolved",
            409
        );
    }

    const resolvedAlert =
        await alertRepository.resolve(alertId);

    if (!resolvedAlert) {
        throw new Error(
            "Failed to resolve alert"
        );
    }

    logger.info(
        "Alert resolved successfully",
        {
            alertId,
            deviceId: alert.device_id,
        }
    );

    return resolvedAlert;
}