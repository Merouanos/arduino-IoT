import crypto from "crypto";
import bcrypt from "bcrypt";
import * as deviceRepository from "../repositories/device.repository";
import { logger } from "../lib/logger";
import { AppError } from "../lib/app.error";

export async function createDevice(
    userId: string,
    name: string
) {
    const deviceKey = crypto.randomBytes(32).toString("hex");

    const deviceKeyHash = await bcrypt.hash(
        deviceKey,
        12
    );

    const deviceData: deviceRepository.CreateDeviceData = {
        userId,
        name,
        deviceKeyHash,
    };

    const device = await deviceRepository.create(deviceData);

    logger.info("Device created successfully", device.id);

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

export async function getUserDevices(userId: string) {
    const devices = await deviceRepository.findByUserId(userId);

    logger.info("User devices retrieved", userId);

    return devices.map((device) => ({
        id: device.id,
        name: device.name,
        createdAt: device.created_at,
        lastSeenAt: device.last_seen_at,
    }));
}

export async function getDevice(
    deviceId: string,
    userId: string
) {
    const device = await deviceRepository.findByIdAndUser(
        deviceId,
        userId
    );

    if (!device) {
        logger.warn(
            "User attempted to access a device they do not own",
            { userId, deviceId }
        );

        throw new AppError(
            "Device not found",
            404
        );
    }

    return {
        id: device.id,
        name: device.name,
        createdAt: device.created_at,
        lastSeenAt: device.last_seen_at,
    };
}

export async function updateDevice(
    deviceId: string,
    userId: string,
    name?: string
) {
    const device = await deviceRepository.findByIdAndUser(
        deviceId,
        userId
    );

    if (!device) {
        logger.warn(
            "User attempted to update a device they do not own",
            { userId, deviceId }
        );

        throw new AppError(
            "Device not found",
            404
        );
    }

    const updateData: deviceRepository.UpdateDeviceData = {
        name,
    };

    const updatedDevice = await deviceRepository.update(
        deviceId,
        updateData
    );

    if (!updatedDevice) {
        throw new Error("Failed to update device");
    }

    logger.info(
        "Device updated successfully",
        deviceId
    );

    return {
        id: updatedDevice.id,
        name: updatedDevice.name,
        createdAt: updatedDevice.created_at,
        lastSeenAt: updatedDevice.last_seen_at,
    };
}

export async function deleteDevice(
    deviceId: string,
    userId: string
) {
    const device = await deviceRepository.findByIdAndUser(
        deviceId,
        userId
    );

    if (!device) {
        logger.warn(
            "User attempted to delete a device they do not own",
            { userId, deviceId }
        );

        throw new AppError(
            "Device not found",
            404
        );
    }

    const deletedDevice =
        await deviceRepository.deleteById(deviceId);

    if (!deletedDevice) {
        throw new Error("Failed to delete device");
    }

    logger.info(
        "Device deleted successfully",
        deviceId
    );

    return {
        id: deletedDevice.id,
    };
}

export async function regenerateDeviceKey(
    deviceId: string,
    userId: string
) {
    const device = await deviceRepository.findByIdAndUser(
        deviceId,
        userId
    );

    if (!device) {
        logger.warn(
            "User attempted to regenerate a key for a device they do not own",
            { userId, deviceId }
        );

        throw new AppError(
            "Device not found",
            404
        );
    }

    const deviceKey = crypto.randomBytes(32).toString("hex");

    const deviceKeyHash = await bcrypt.hash(
        deviceKey,
        12
    );

    const updatedDevice =
        await deviceRepository.updateKeyHash(
            deviceId,
            deviceKeyHash
        );

    if (!updatedDevice) {
        throw new Error(
            "Failed to regenerate device key"
        );
    }

    logger.info(
        "Device key regenerated successfully",
        deviceId
    );

    return {
        deviceId,
        deviceKey,
    };
}