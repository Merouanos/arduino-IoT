"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.findById = findById;
exports.findByDeviceId = findByDeviceId;
exports.findActiveByDeviceIdAndType = findActiveByDeviceIdAndType;
exports.resolve = resolve;
exports.updateActive = updateActive;
const db_1 = __importDefault(require("../database/db"));
async function create(data) {
    const result = await db_1.default.query(`
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
        `, [
        data.deviceId,
        data.type,
        data.severity,
        data.message
    ]);
    return result.rows[0];
}
async function findById(id) {
    const result = await db_1.default.query(`
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
        `, [id]);
    return result.rows[0] ?? null;
}
async function findByDeviceId(deviceId) {
    const result = await db_1.default.query(`
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
        `, [deviceId]);
    return result.rows;
}
async function findActiveByDeviceIdAndType(deviceId, type) {
    const result = await db_1.default.query(`
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
        `, [deviceId, type]);
    return result.rows[0] ?? null;
}
async function resolve(id) {
    const result = await db_1.default.query(`
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
        `, [id]);
    return result.rows[0] ?? null;
}
async function updateActive(id, severity, message) {
    const result = await db_1.default.query(`
        UPDATE alerts
        SET
            severity = $1,
            message = $2
        WHERE id = $3
          AND resolved_at IS NULL
        RETURNING
            id,
            device_id,
            type,
            severity,
            message,
            started_at,
            resolved_at
        `, [severity, message, id]);
    return result.rows[0] ?? null;
}
