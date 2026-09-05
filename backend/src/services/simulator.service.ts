import { AppError } from "../lib/app.error";
import * as deviceRepository from "../repositories/device.repository";

const simulatorUrl =
    process.env.SIMULATOR_URL ?? "http://simulator:4000";
const simulatorToken = process.env.SIMULATOR_CONTROL_TOKEN;

async function requestSimulator(
    path: "/status" | "/pause" | "/resume"
) {
    if (!simulatorToken) {
        throw new AppError("Simulator control is not configured", 503);
    }

    try {
        const response = await fetch(`${simulatorUrl}${path}`, {
            method: path === "/status" ? "GET" : "POST",
            headers: {
                "X-Simulator-Token": simulatorToken,
            },
        });

        if (!response.ok) {
            throw new AppError("Simulator control unavailable", 503);
        }

        return (await response.json()) as { suspended: boolean };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError("Simulator control unavailable", 503);
    }
}

async function assertSimulatorDevice(
    deviceId: string,
    userId: string
) {
    const device = await deviceRepository.findByIdAndUser(
        deviceId,
        userId
    );

    if (!device) {
        throw new AppError("Device not found", 404);
    }

    if (process.env.SIMULATOR_DEVICE_ID !== deviceId) {
        throw new AppError(
            "Simulator is not assigned to this device",
            409
        );
    }
}

export async function getStatus(
    deviceId: string,
    userId: string
) {
    await assertSimulatorDevice(deviceId, userId);
    return requestSimulator("/status");
}

export async function setSuspended(
    deviceId: string,
    userId: string,
    suspended: boolean
) {
    await assertSimulatorDevice(deviceId, userId);
    return requestSimulator(suspended ? "/pause" : "/resume");
}
