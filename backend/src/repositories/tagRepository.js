import { pool } from "../config/database.js";

export async function findAllTags() {
    const result = await pool.query(`
        SELECT id, name
        FROM tags
        ORDER BY name
    `);

    return result.rows;
}

export async function findOrCreateTag(client, name) {
    const result = await client.query(
        `
            INSERT INTO tags (name)
            VALUES ($1)
            ON CONFLICT (name)
            DO UPDATE SET name = EXCLUDED.name
            RETURNING id, name
        `,
        [name]
    );

    return result.rows[0];
}