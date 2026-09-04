import { SerialPort } from "serialport";

interface SerialConfig {
    port: string;
    baudRate: number;
}

export function createSerialPort(
    config: SerialConfig
): SerialPort {
    const serialPort = new SerialPort({
        path: config.port,
        baudRate: config.baudRate,
    });

    serialPort.on("open", () => {
        console.log(
            `[SERIAL] Connected to ${config.port} at ${config.baudRate} baud`
        );
    });

    serialPort.on("error", (error) => {
        console.error(
            "[SERIAL] Error:",
            error.message
        );
    });

    serialPort.on("close", () => {
        console.log(
            "[SERIAL] Connection closed"
        );
    });

    return serialPort;
}