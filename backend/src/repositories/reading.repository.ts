import db from "../database/db";

export interface CreateReadingData {
    deviceId: string;
    temperature: number;
    humidity: number;
    freeRam: number;
    temperatureStatus: number;
    humidityStatus: number;
    recordedAt?: Date;
}

export async function create(data: CreateReadingData) {
    const result = await db.query(
        `
        INSERT INTO sensor_readings (
            device_id,
            temperature,
            humidity,
            free_ram,
            temperature_status,
            humidity_status,
            recorded_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_TIMESTAMP))
        RETURNING
            id,
            device_id,
            temperature,
            humidity,
            free_ram,
            temperature_status,
            humidity_status,
            recorded_at
        `,
        [
            data.deviceId,
            data.temperature,
            data.humidity,
            data.freeRam,
            data.temperatureStatus,
            data.humidityStatus,
            data.recordedAt ?? null
        ]
    );

    return result.rows[0];
}

export async function findLatestByDeviceId(deviceId: string) {
    const result = await db.query(
        `
        SELECT
            id,
            device_id,
            temperature,
            humidity,
            free_ram,
            temperature_status,
            humidity_status,
            recorded_at
        FROM sensor_readings
        WHERE device_id = $1
        ORDER BY recorded_at DESC
        LIMIT 1
        `,
        [deviceId]
    );

    return result.rows[0] ?? null;
}

export async function findByDeviceId(deviceId: string) {
    const result = await db.query(
        `
        SELECT
            id,
            device_id,
            temperature,
            humidity,
            free_ram,
            temperature_status,
            humidity_status,
            recorded_at
        FROM sensor_readings
        WHERE device_id = $1
        ORDER BY recorded_at DESC
        `,
        [deviceId]
    );

    return result.rows;
}