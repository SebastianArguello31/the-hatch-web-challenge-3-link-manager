import { Router } from "express";
import { findAllTags } from "../repositories/tagRepository.js";

// Listar etiquetas no requiere reglas adicionales: consulta directamente el repositorio.
// app.js monta esta ruta en /api/tags.
const router = Router();

router.get("/", async (req, res) => {
    const tags = await findAllTags();
    res.json(tags);
});

export default router;
