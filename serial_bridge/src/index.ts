import "dotenv/config";

import { createSerialPort } from "./serial.js";
import { sendReading } from "./client.js";
import type { SensorReading } from "./types.js";

const serialPort =
    process.env.SERIAL_PORT;

const baudRate = Number(
    process.env.SERIAL_BAUD_RATE ?? 9600
);

const backendUrl =
    process.env.BACKEND_URL ??
    "http://localhost:3000";

const deviceId =
    process.env.DEVICE_ID;

const deviceKey =
    process.env.DEVICE_KEY;

if (!serialPort) {
    throw new Error(
        "SERIAL_PORT is required"
    );
}

if (!deviceId) {
    throw new Error(
        "DEVICE_ID is required"
    );
}

if (!deviceKey) {
    throw new Error(
        "DEVICE_KEY is required"
    );
}

if (!Number.isFinite(baudRate)) {
    throw new Error(
        "SERIAL_BAUD_RATE must be a valid number"
    );
}

const config = {
    backendUrl,
    deviceId,
    deviceKey,
};

const serial = createSerialPort({
    port: serialPort,
    baudRate,
});

let buffer = "";

serial.on("data", (chunk: Buffer) => {
    buffer += chunk.toString("utf8");

    const lines =
        buffer.split(/\r?\n/);

    buffer = lines.pop() ?? "";

    for (const line of lines) {
        const trimmed =
            line.trim();

        if (!trimmed) {
            continue;
        }

        processLine(trimmed);
    }
});

async function processLine(
    line: string
): Promise<void> {
    let reading: SensorReading;

    try {
        reading =
            JSON.parse(line) as SensorReading;
    } catch {
        console.log(
            `[SERIAL] Ignored: ${line}`
        );

        return;
    }

    console.log(
        "[SERIAL] Reading:",
        reading
    );

    try {
        await sendReading(
            config,
            reading
        );
    } catch (error) {
        console.error(
            "[HTTP] Failed to send reading:",
            error
        );
    }
}

console.log(
    "[BRIDGE] Starting..."
);

console.log(
    `[BRIDGE] Serial port: ${serialPort}`
);

console.log(
    `[BRIDGE] Baud rate: ${baudRate}`
);

console.log(
    `[BRIDGE] Backend: ${backendUrl}`
);

console.log(
    `[BRIDGE] Device: ${deviceId}`
);