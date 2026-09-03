import * as readingRepository from "../repositories/reading.repository";
import * as deviceRepository from "../repositories/device.repository";
import type { ReadingInput } from "../schemas/reading.schema";
import { logger } from "../lib/logger";

const statusToNumber = {
    normal: 0,
    warning: 1,
    critical: 2,
} as const;

export async function createReading(
    deviceId: string,
    data: ReadingInput
) {
    const temperatureStatus =
        statusToNumber[data.temperature_status];

    const humidityStatus =
        statusToNumber[data.humidity_status];

    const reading = await readingRepository.create({
        deviceId,
        temperature: data.temperature,
        humidity: data.humidity,
        freeRam: data.free_ram,
        temperatureStatus,
        humidityStatus,
    });

    const lastSeen = await deviceRepository.updateLastSeen(deviceId);

    if (!lastSeen) {
        logger.error(
            "Failed to update device last seen",
            deviceId
        );

        throw new Error("Failed to update device last seen");
    }

    logger.info(
        "Sensor reading stored successfully",
        {
            deviceId,
            readingId: reading.id,
        }
    );

    return reading;
}

export async function getLatestReading(
    deviceId: string,
    userId: string
) {
    const device = await deviceRepository.findByIdAndUser(
        deviceId,
        userId
    );

    if (!device) {
        logger.warn(
        "User attempted to access an unauthorized or nonexistent device",
        { userId, deviceId }
        );
        throw new Error("Device not found");
    }

    return readingRepository.findLatestByDeviceId(deviceId);
}

export async function getReadingHistory(deviceId: string, userId: string) {
    const device = await deviceRepository.findByIdAndUser(deviceId, userId);

    if (!device) {
        logger.warn(
        "User attempted to access an unauthorized or nonexistent device",
        { userId, deviceId }
        );

        throw new Error("Device not found");
    }

    return readingRepository.findByDeviceId(deviceId);
}