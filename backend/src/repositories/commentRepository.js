import { pool } from "../config/database.js";

// Orden cronológico; el ID resuelve empates entre fechas iguales.
export async function findCommentsByLinkId(linkId) {
    const result = await pool.query(
        `
            SELECT id, link_id, author, content, created_at
            FROM comments
            WHERE link_id = $1
            ORDER BY created_at ASC, id ASC
        `,
        [linkId]
    );

    return result.rows;
}

// Los parámetros se envían separados del SQL. RETURNING devuelve el comentario creado.
export async function insertComment({ linkId, author, content }) {
    const result = await pool.query(
        `
            INSERT INTO comments (link_id, author, content)
            VALUES ($1, $2, $3)
            RETURNING id, link_id, author, content, created_at
        `,
        [linkId, author, content]
    );

    return result.rows[0];
}
