import { pool } from "../config/database.js";
import { findOrCreateTag } from "./tagRepository.js";

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

        for (const name of tags) {
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
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

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