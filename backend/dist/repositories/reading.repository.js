"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.findLatestByDeviceId = findLatestByDeviceId;
exports.findByDeviceId = findByDeviceId;
const db_1 = __importDefault(require("../database/db"));
async function create(data) {
    const result = await db_1.default.query(`
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
        `, [
        data.deviceId,
        data.temperature,
        data.humidity,
        data.freeRam,
        data.temperatureStatus,
        data.humidityStatus,
        data.recordedAt ?? null
    ]);
    return result.rows[0];
}
async function findLatestByDeviceId(deviceId) {
    const result = await db_1.default.query(`
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
        `, [deviceId]);
    return result.rows[0] ?? null;
}
async function findByDeviceId(deviceId) {
    const result = await db_1.default.query(`
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
        `, [deviceId]);
    return result.rows;
}
