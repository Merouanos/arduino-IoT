import * as readingRepository from "../repositories/reading.repository";
import * as deviceRepository from "../repositories/device.repository";
import * as alertService from "./alert.service";
import type { ReadingInput } from "../schemas/reading.schema";
import { getIO } from "../lib/socket";
import { logger } from "../lib/logger";
import { AppError } from "../lib/app.error";

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

    await processAlert(
        deviceId,
        "temperature",
        data.temperature_status,
        data.temperature
    );

    await processAlert(
        deviceId,
        "humidity",
        data.humidity_status,
        data.humidity
    );

    const lastSeen =
        await deviceRepository.updateLastSeen(deviceId);

    if (!lastSeen) {
        throw new Error(
            "Failed to update device last seen"
        );
    }
    const io = getIO();
    
    io.to(`device:${deviceId}`).emit(
        "reading",
        reading
    );

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
    const device =
        await deviceRepository.findByIdAndUser(
            deviceId,
            userId
        );

    if (!device) {
        logger.warn(
            "User attempted to access an unauthorized or nonexistent device",
            { userId, deviceId }
        );

        throw new AppError(
            "Device not found",
            404
        );
    }

    return readingRepository.findLatestByDeviceId(
        deviceId
    );
}

export async function getReadingHistory(
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
            "User attempted to access an unauthorized or nonexistent device",
            { userId, deviceId }
        );

        throw new AppError(
            "Device not found",
            404
        );
    }

    return readingRepository.findByDeviceId(
        deviceId
    );
}

async function processAlert(
    deviceId: string,
    type: "temperature" | "humidity",
    status: ReadingInput["temperature_status"],
    value: number
) {
    if (status === "normal") {
        await alertService.resolveActiveAlert(
            deviceId,
            type
        );

        return;
    }

    const severity = status;

    await alertService.createAlert(
        deviceId,
        type,
        severity,
        `${type} is ${status}: ${value}`
    );
}