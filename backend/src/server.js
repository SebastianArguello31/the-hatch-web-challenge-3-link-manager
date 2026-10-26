import app from "./app.js";
import { pool } from "./config/database.js";

const port = Number(process.env.PORT ?? 3000);

async function startServer() {
    try {
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            throw new Error("PORT debe ser un entero entre 1 y 65535.");
        }

        await pool.query(`
            SELECT links.id
            FROM links
            JOIN link_tags ON link_tags.link_id = links.id
            JOIN tags ON tags.id = link_tags.tag_id
            JOIN comments ON comments.link_id = links.id
            LIMIT 0
        `);

        const server = app.listen(port, () => {
            console.log(`API disponible en http://localhost:${port}`);
        });

        server.on("error", async (error) => {
            console.error("No se pudo iniciar el servidor:", error.message);
            await pool.end();
            process.exitCode = 1;
        });
    } catch (error) {
        console.error("No se pudo iniciar la aplicación:", error.message);
        console.error(
            "Comprueba la configuración de PostgreSQL y aplica database/schema.sql."
        );

        await pool.end();
        process.exitCode = 1;
    }
}

startServer();