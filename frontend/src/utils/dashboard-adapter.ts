import type { Reading } from "../types/reading";
import type { DashboardReading } from "../types/dashboard";

export function toDashboardReading(
    reading: Reading
): DashboardReading {
    return {
        temperature: reading.temperature,
        humidity: reading.humidity,
        freeRam: reading.free_ram,
        temperatureStatus:
            reading.temperature_status,
        humidityStatus:
            reading.humidity_status,
    };
}

export function toTemperatureHistory(
    readings: Reading[]
): number[] {
    return readings.map(
        (reading) => reading.temperature
    );
}

export function upsertAlert(
    alerts: import("../types/alert").Alert[],
    nextAlert: import("../types/alert").Alert
) {
    const exists = alerts.some(
        (alert) =>
            alert.id === nextAlert.id
    );

    if (!exists) {
        return [
            nextAlert,
            ...alerts,
        ];
    }

    return alerts.map(
        (alert) =>
            alert.id ===
            nextAlert.id
                ? nextAlert
                : alert
    );
}