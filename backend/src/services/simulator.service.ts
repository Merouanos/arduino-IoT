import { AppError } from "../lib/app.error";
import * as deviceRepository from "../repositories/device.repository";

const simulatorUrl =
    process.env.SIMULATOR_INTERNAL_URL;

const simulatorToken =
    process.env.SIMULATOR_CONTROL_TOKEN;

async function simulatorRequest(
    path: string,
    options: RequestInit = {}
) {
    if (
        !simulatorUrl ||
        !simulatorToken
    ) {
        throw new AppError(
            "Simulator is not configured",
            503
        );
    }

    const response = await fetch(
        `${simulatorUrl}${path}`,
        {
            ...options,
            headers: {
                "Content-Type":
                    "application/json",
                "X-Simulator-Token":
                    simulatorToken,
                ...(options.headers ?? {}),
            },
        }
    );

    if (!response.ok) {
        const message = await response.text();
        throw new AppError(
            message || "Simulator request failed",
            502
        );
    }

    return response.json();
}

export async function startSimulation(
    deviceId: string,
    userId: string,
    scenario: string
) {
    const device =
        await deviceRepository.findByIdAndUser(
            deviceId,
            userId
        );

    if (!device) {
        throw new AppError(
            "Device not found",
            404
        );
    }

    return simulatorRequest(
        "/sessions/start",
        {
            method: "POST",
            body: JSON.stringify({
                deviceId,
                scenario,
            }),
        }
    );
}

export async function stopSimulation(
    deviceId: string,
    userId: string
) {
    const device =
        await deviceRepository.findByIdAndUser(
            deviceId,
            userId
        );

    if (!device) {
        throw new AppError(
            "Device not found",
            404
        );
    }

    return simulatorRequest(
        "/sessions/stop",
        {
            method: "POST",
            body: JSON.stringify({
                deviceId,
            }),
        }
    );
}

export async function getSimulationStatus(
    deviceId: string,
    userId: string
) {
    const device =
        await deviceRepository.findByIdAndUser(
            deviceId,
            userId
        );

    if (!device) {
        throw new AppError(
            "Device not found",
            404
        );
    }

    return simulatorRequest(
        `/sessions/${deviceId}`
    );
}

export async function setSuspended(
    deviceId: string,
    userId: string,
    suspended: boolean
) {
    const device =
        await deviceRepository.findByIdAndUser(
            deviceId,
            userId
        );

    if (!device) {
        throw new AppError(
            "Device not found",
            404
        );
    }

    if (!suspended) {
        return startSimulation(
            deviceId,
            userId,
            "random"
        );
    }

    return simulatorRequest(
        "/sessions/suspend",
        {
            method: "POST",
            body: JSON.stringify({ deviceId }),
        }
    );
}

export const getStatus = getSimulationStatus;