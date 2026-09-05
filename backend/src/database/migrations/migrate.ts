import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import pg from "pg";

const { Client } = pg;

async function migrate() {
    const databaseUrl =
        process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error(
            "DATABASE_URL is not configured"
        );
    }

    const client = new Client({
        connectionString: databaseUrl,
    });

    await client.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename VARCHAR PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL
                    DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const migrationsDir = path.join(
            process.cwd(),
            "migrations"
        );

        const files = (
            await fs.readdir(
                migrationsDir
            )
        )
            .filter((file) =>
                /^\d+_.*\.sql$/.test(file)
            )
            .sort();

        for (const file of files) {
            const result =
                await client.query(
                    `
                    SELECT 1
                    FROM schema_migrations
                    WHERE filename = $1
                    `,
                    [file]
                );

            if (
                result.rowCount !== 0
            ) {
                console.log(
                    `Skipping migration: ${file}`
                );

                continue;
            }

            const filePath =
                path.join(
                    migrationsDir,
                    file
                );

            const sql =
                await fs.readFile(
                    filePath,
                    "utf8"
                );

            console.log(
                `Running migration: ${file}`
            );

            await client.query("BEGIN");

            try {
                await client.query(sql);

                await client.query(
                    `
                    INSERT INTO schema_migrations (
                        filename
                    )
                    VALUES ($1)
                    `,
                    [file]
                );

                await client.query(
                    "COMMIT"
                );

                console.log(
                    `Migration complete: ${file}`
                );
            } catch (error) {
                await client.query(
                    "ROLLBACK"
                );

                throw error;
            }
        }

        console.log(
            "Database migrations completed successfully."
        );
    } finally {
        await client.end();
    }
}

migrate().catch((error) => {
    console.error(
        "Database migration failed:",
        error
    );

    process.exit(1);
});