import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./config/database.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

const allowedOrigins = (
    process.env.CLIENT_ORIGINS
    ?? "http://localhost:5173,http://localhost:5500"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({ origin: allowedOrigins, }));
app.use(express.json({ limit: "100kb" }));

app.use((req, res) => {
    res.status(404).json({
        error: "La ruta solicitada no existe.",
    });
});

app.use(errorHandler);

pool.on("error", (error) => {
    console.error("Error en una conexión inactiva de PostgreSQL:", error);
});

async function startServer() {
    try {
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            throw new Error("PORT debe ser un entero entre 1 y 65535.");
        }

        await pool.query("SELECT 1");

        const server = app.listen(port, () => {
            console.log(`API disponible en http://localhost:${port}`);
        });

        server.on("error", async (error) => {
            console.error("No se pudo iniciar el servidor HTTP:", error);
            await pool.end();
            process.exitCode = 1;
        });
    } catch (error) {
        console.error("No se pudo iniciar la aplicación:", error);
        await pool.end();
        process.exitCode = 1;
    }
}

startServer();