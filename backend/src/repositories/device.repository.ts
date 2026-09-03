import db from "../database/db";
import type { PoolClient } from "pg";


export interface CreateDeviceData {
    userId: string;
    name: string;
    deviceKeyHash: string;
}

export interface UpdateDeviceData {
    name?: string;
}

export async function findById(id: string) {
    const result = await db.query(
        `
        SELECT
            id,
            user_id,
            name,
            device_key_hash,
            created_at,
            last_seen_at
        FROM devices
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0] ?? null;
}

export async function findByIdAndUser(
    id: string,
    userId: string
) {
    const result = await db.query(
        `
        SELECT
            id,
            user_id,
            name,
            device_key_hash,
            created_at,
            last_seen_at
        FROM devices
        WHERE id = $1 AND user_id = $2
        `,
        [id, userId]
    );

    return result.rows[0] ?? null;
}

export async function findByKeyHash(deviceKeyHash: string) {
    const result = await db.query(
        `
        SELECT
            id,
            user_id,
            name,
            device_key_hash,
            created_at,
            last_seen_at
        FROM devices
        WHERE device_key_hash = $1
        `,
        [deviceKeyHash]
    );

    return result.rows[0] ?? null;
}

export async function findByUserId(userId: string) {
    const result = await db.query(
        `
        SELECT
            id,
            user_id,
            name,
            device_key_hash,
            created_at,
            last_seen_at
        FROM devices
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return result.rows;
}

export async function create(data: CreateDeviceData) {
    const result = await db.query(
        `
        INSERT INTO devices (
            user_id,
            name,
            device_key_hash
        )
        VALUES ($1, $2, $3)
        RETURNING
            id,
            user_id,
            name,
            device_key_hash,
            created_at,
            last_seen_at
        `,
        [
            data.userId,
            data.name,
            data.deviceKeyHash
        ]
    );

    return result.rows[0];
}

export async function update(
    id: string,
    data: UpdateDeviceData
) {
    const result = await db.query(
        `
        UPDATE devices
        SET name = COALESCE($1, name)
        WHERE id = $2
        RETURNING
            id,
            user_id,
            name,
            device_key_hash,
            created_at,
            last_seen_at
        `,
        [
            data.name ?? null,
            id
        ]
    );

    return result.rows[0] ?? null;
}

export async function deleteById(id: string) {
    const result = await db.query(
        `
        DELETE FROM devices
        WHERE id = $1
        RETURNING id
        `,
        [id]
    );

    return result.rows[0] ?? null;
}

export async function updateKeyHash(
    id: string,
    deviceKeyHash: string
) {
    const result = await db.query(
        `
        UPDATE devices
        SET device_key_hash = $1
        WHERE id = $2
        RETURNING id
        `,
        [deviceKeyHash, id]
    );

    return result.rows[0] ?? null;
}



export async function updateLastSeen(id: string) {
    const result = await db.query(
        `
        UPDATE devices
        SET last_seen_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING
            id,
            last_seen_at
        `,
        [id]
    );

    return result.rows[0] ?? null;
}