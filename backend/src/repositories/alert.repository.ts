import db from "../database/db";

export interface CreateAlertData {
    deviceId: string;
    type: string;
    severity: string;
    message: string;
}

export async function create(data: CreateAlertData) {
    const result = await db.query(
        `
        INSERT INTO alerts (
            device_id,
            type,
            severity,
            message
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            device_id,
            type,
            severity,
            message,
            started_at,
            resolved_at
        `,
        [
            data.deviceId,
            data.type,
            data.severity,
            data.message
        ]
    );

    return result.rows[0];
}

export async function findById(id: string) {
    const result = await db.query(
        `
        SELECT
            id,
            device_id,
            type,
            severity,
            message,
            started_at,
            resolved_at
        FROM alerts
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0] ?? null;
}

export async function findByDeviceId(deviceId: string) {
    const result = await db.query(
        `
        SELECT
            id,
            device_id,
            type,
            severity,
            message,
            started_at,
            resolved_at
        FROM alerts
        WHERE device_id = $1
        ORDER BY started_at DESC
        `,
        [deviceId]
    );

    return result.rows;
}

export async function findActiveByDeviceIdAndType(
    deviceId: string,
    type: string
) {
    const result = await db.query(
        `
        SELECT
            id,
            device_id,
            type,
            severity,
            message,
            started_at,
            resolved_at
        FROM alerts
        WHERE device_id = $1
          AND type = $2
          AND resolved_at IS NULL
        ORDER BY started_at DESC
        LIMIT 1
        `,
        [deviceId, type]
    );

    return result.rows[0] ?? null;
}

export async function resolve(id: string) {
    const result = await db.query(
        `
        UPDATE alerts
        SET resolved_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND resolved_at IS NULL
        RETURNING
            id,
            device_id,
            type,
            severity,
            message,
            started_at,
            resolved_at
        `,
        [id]
    );

    return result.rows[0] ?? null;
}