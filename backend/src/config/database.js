import "dotenv/config";
import pg from "pg";

export const pool = new pg.Pool({
    connectionTimeoutMillis: 5000,
});

pool.on("error", (error) => {
    console.error(
        "Error en una conexión inactiva de PostgreSQL:",
        error.message
    );
});