import type { SensorReading } from "./types.js";

interface BridgeConfig {
    backendUrl: string;
    deviceId: string;
    deviceKey: string;
}

export async function sendReading(
    config: BridgeConfig,
    reading: SensorReading
): Promise<void> {
    const url =
        `${config.backendUrl}/api/devices/${config.deviceId}/readings`;

    const response = await fetch(url, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "X-Device-Key": config.deviceKey,
        },

        body: JSON.stringify(reading),
    });

    const body = await response.text();

    if (!response.ok) {
        throw new Error(
            `Backend request failed ` +
            `(${response.status}): ${body}`
        );
    }

    console.log(
        `[HTTP] Reading accepted (${response.status})`
    );
}