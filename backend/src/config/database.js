import "dotenv/config";
import pg from "pg";

// pg lee PGHOST, PGPORT, PGDATABASE, PGUSER y PGPASSWORD del entorno.
// El pool reutiliza conexiones y deja de esperar tras cinco segundos al conectar.
export const pool = new pg.Pool({
    connectionTimeoutMillis: 5000,
});

// Registra fallos de conexiones inactivas sin dejar el evento de error sin manejar.
pool.on("error", (error) => {
    console.error(
        "Error en una conexión inactiva de PostgreSQL:",
        error.message
    );
});
