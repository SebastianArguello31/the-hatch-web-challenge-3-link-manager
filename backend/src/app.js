import "dotenv/config";
import express from "express";
import cors from "cors";

import linkRoutes from "./routes/linkRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Configura Express; server.js se encarga de abrir el puerto.
const app = express();

// Convierte la lista del .env en los orígenes permitidos para peticiones del navegador.
const allowedOrigins = (
    process.env.CLIENT_ORIGINS
    ?? "http://localhost:5173,http://localhost:5500"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
// Lee cuerpos JSON y limita su tamaño antes de ejecutar las rutas.
app.use(express.json({ limit: "100kb" }));

app.use("/api/links", linkRoutes);
app.use("/api/tags", tagRoutes);

// Si ninguna ruta respondió, devuelve un 404 con el mismo formato JSON de la API.
app.use((req, res) => {
    res.status(404).json({
        error: "La ruta solicitada no existe.",
    });
});

// El manejador de errores va al final para recibir los fallos de las rutas.
app.use(errorHandler);

export default app;
