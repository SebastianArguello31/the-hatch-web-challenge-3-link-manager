import { pool } from "../config/database.js";
import { findOrCreateTag } from "./tagRepository.js";

// $1 recibe el filtro por separado del SQL; nunca se concatena texto del usuario.
// json_agg reúne las etiquetas y COALESCE devuelve [] si no hay ninguna.
export async function findAllLinks(tag) {
    const result = await pool.query(
        `
            SELECT
                links.id,
                links.title,
                links.url,
                links.description,
                links.score,
                links.created_at,
                COALESCE(
                    (
                        SELECT json_agg(tags.name ORDER BY tags.name)
                        FROM link_tags
                        JOIN tags ON tags.id = link_tags.tag_id
                        WHERE link_tags.link_id = links.id
                    ),
                    '[]'::json
                ) AS tags
            FROM links
            WHERE (
                $1::text IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM link_tags
                    JOIN tags ON tags.id = link_tags.tag_id
                    WHERE link_tags.link_id = links.id
                    AND tags.name = $1
                )
            )
            ORDER BY links.created_at DESC, links.id DESC
        `,
        [tag ?? null]
    );

    return result.rows;
}

// Devuelve el enlace con sus etiquetas, o null si no existe.
export async function findLinkById(id) {
    const result = await pool.query(
        `
            SELECT
                links.id,
                links.title,
                links.url,
                links.description,
                links.score,
                links.created_at,
                COALESCE(
                    (
                        SELECT json_agg(tags.name ORDER BY tags.name)
                        FROM link_tags
                        JOIN tags ON tags.id = link_tags.tag_id
                        WHERE link_tags.link_id = links.id
                    ),
                    '[]'::json
                ) AS tags
            FROM links
            WHERE links.id = $1
        `,
        [id]
    );

    return result.rows[0] ?? null;
}

// La transacción guarda enlace, etiquetas y relaciones como una sola operación.
// Todas sus consultas deben usar la misma conexión (client).
export async function insertLinkWithTags({ title, url, description, tags, }) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `
                INSERT INTO links (title, url, description)
                VALUES ($1, $2, $3)
                RETURNING id, title, url, description, score, created_at
            `,
            [title, url, description]
        );

        const link = result.rows[0];
        const savedTags = [];

        // Un orden fijo evita bloqueos cruzados entre creaciones con las mismas etiquetas.
        for (const name of [...tags].sort()) {
            const tag = await findOrCreateTag(client, name);

            await client.query(
                `
                    INSERT INTO link_tags (link_id, tag_id)
                    VALUES ($1, $2)
                `,
                [link.id, tag.id]
            );

            savedTags.push(tag.name);
        }

        await client.query("COMMIT");

        return {
            ...link,
            tags: savedTags.sort(),
        };
    } catch (error) {
        // Conserva el error original incluso si también falla el rollback.
        await client.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        // Devuelve la conexión al pool tanto al guardar como al fallar.
        client.release();
    }
}

// PostgreSQL incrementa la puntuación de forma atómica para no perder votos simultáneos.
export async function updateLinkScore(id, value) {
    const result = await pool.query(
        `
            UPDATE links
            SET score = score + $1
            WHERE id = $2
            RETURNING id, score
        `,
        [value, id]
    );

    return result.rows[0] ?? null;
}
