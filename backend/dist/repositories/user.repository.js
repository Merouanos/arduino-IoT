"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findById = findById;
exports.findByEmail = findByEmail;
exports.create = create;
exports.update = update;
const db_1 = __importDefault(require("../database/db"));
async function findById(id) {
    const result = await db_1.default.query(`
        SELECT id, email, password_hash, created_at, updated_at
        FROM users
        WHERE id = $1
        `, [id]);
    return result.rows[0] ?? null;
}
async function findByEmail(email) {
    const result = await db_1.default.query(`
        SELECT id, email, password_hash, created_at, updated_at
        FROM users
        WHERE email = $1
        `, [email]);
    return result.rows[0] ?? null;
}
async function create(data) {
    const result = await db_1.default.query(`
        INSERT INTO users (email, password_hash)
        VALUES ($1, $2)
        RETURNING id, email, password_hash, created_at, updated_at
        `, [data.email, data.passwordHash]);
    return result.rows[0];
}
async function update(id, data) {
    const result = await db_1.default.query(`
        UPDATE users
        SET
            email = COALESCE($1, email),
            password_hash = COALESCE($2, password_hash),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, email, password_hash, created_at, updated_at
        `, [
        data.email ?? null,
        data.passwordHash ?? null,
        id
    ]);
    return result.rows[0] ?? null;
}
