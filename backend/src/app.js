import "dotenv/config";
import express from "express";
import cors from "cors";

import linkRoutes from "./routes/linkRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

const allowedOrigins = (
    process.env.CLIENT_ORIGINS
    ?? "http://localhost:5173,http://localhost:5500"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "100kb" }));

app.use("/api/links", linkRoutes);
app.use("/api/tags", tagRoutes);

app.use((req, res) => {
    res.status(404).json({
        error: "La ruta solicitada no existe.",
    });
});

app.use(errorHandler);

export default app;