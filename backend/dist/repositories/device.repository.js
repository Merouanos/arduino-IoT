"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findById = findById;
exports.findByIdAndUser = findByIdAndUser;
exports.findByKeyHash = findByKeyHash;
exports.findByUserId = findByUserId;
exports.create = create;
exports.update = update;
exports.deleteById = deleteById;
exports.updateKeyHash = updateKeyHash;
exports.updateLastSeen = updateLastSeen;
const db_1 = __importDefault(require("../database/db"));
async function findById(id) {
    const result = await db_1.default.query(`
        SELECT
            id,
            user_id,
            name,
            device_key_hash,
            created_at,
            last_seen_at
        FROM devices
        WHERE id = $1
        `, [id]);
    return result.rows[0] ?? null;
}
async function findByIdAndUser(id, userId) {
    const result = await db_1.default.query(`
        SELECT
            id,
            user_id,
            name,
            device_key_hash,
            created_at,
            last_seen_at
        FROM devices
        WHERE id = $1 AND user_id = $2
        `, [id, userId]);
    return result.rows[0] ?? null;
}
async function findByKeyHash(deviceKeyHash) {
    const result = await db_1.default.query(`
        SELECT
            id,
            user_id,
            name,
            device_key_hash,
            created_at,
            last_seen_at
        FROM devices
        WHERE device_key_hash = $1
        `, [deviceKeyHash]);
    return result.rows[0] ?? null;
}
async function findByUserId(userId) {
    const result = await db_1.default.query(`
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
        `, [userId]);
    return result.rows;
}
async function create(data) {
    const result = await db_1.default.query(`
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
        `, [
        data.userId,
        data.name,
        data.deviceKeyHash
    ]);
    return result.rows[0];
}
async function update(id, data) {
    const result = await db_1.default.query(`
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
        `, [
        data.name ?? null,
        id
    ]);
    return result.rows[0] ?? null;
}
async function deleteById(id) {
    const result = await db_1.default.query(`
        DELETE FROM devices
        WHERE id = $1
        RETURNING id
        `, [id]);
    return result.rows[0] ?? null;
}
async function updateKeyHash(id, deviceKeyHash) {
    const result = await db_1.default.query(`
        UPDATE devices
        SET device_key_hash = $1
        WHERE id = $2
        RETURNING id
        `, [deviceKeyHash, id]);
    return result.rows[0] ?? null;
}
async function updateLastSeen(id) {
    const result = await db_1.default.query(`
        UPDATE devices
        SET last_seen_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING
            id,
            last_seen_at
        `, [id]);
    return result.rows[0] ?? null;
}
