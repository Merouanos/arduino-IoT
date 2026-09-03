import db from "../database/db";

export interface CreateUserData {
    email: string;
    passwordHash: string;
}

export interface UpdateUserData {
    email?: string;
    passwordHash?: string;
}


export async function findById(id: string) {
    const result = await db.query(
        `
        SELECT id, email, password_hash, created_at, updated_at
        FROM users
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0] ?? null;
}


export async function findByEmail(email: string) {
    const result = await db.query(
        `
        SELECT id, email, password_hash, created_at, updated_at
        FROM users
        WHERE email = $1
        `,
        [email]
    );

    return result.rows[0] ?? null;
}

export async function create(data: CreateUserData) {
    const result = await db.query(
        `
        INSERT INTO users (email, password_hash)
        VALUES ($1, $2)
        RETURNING id, email, password_hash, created_at, updated_at
        `,
        [data.email, data.passwordHash]
    );

    return result.rows[0];
}

export async function update(id: string, data: UpdateUserData) {
    const result = await db.query(
        `
        UPDATE users
        SET
            email = COALESCE($1, email),
            password_hash = COALESCE($2, password_hash),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, email, password_hash, created_at, updated_at
        `,
        [
            data.email ?? null,
            data.passwordHash ?? null,
            id
        ]
    );

    return result.rows[0] ?? null;
}