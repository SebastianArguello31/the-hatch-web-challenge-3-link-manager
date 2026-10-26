import { Router } from "express";
import { listLinks, getLink, createLink, voteLink, } from "../services/linkService.js";
import { listComments, createComment, } from "../services/commentService.js";

// app.js añade el prefijo /api/links a estas rutas.
// Las rutas traducen HTTP a llamadas de servicio; Express 5 propaga sus errores async.
const router = Router();

// El filtro opcional llega en la URL, por ejemplo: /api/links?tag=react.
router.get("/", async (req, res) => {
    const links = await listLinks(req.query.tag);
    res.json(links);
});

// 201 indica creación; Location informa dónde consultar el nuevo enlace.
router.post("/", async (req, res) => {
    const link = await createLink(req.body);

    res.status(201)
        .location(`/api/links/${link.id}`)
        .json(link);
});

// Los comentarios y votos pertenecen al enlace identificado por :id.
router.get("/:id/comments", async (req, res) => {
    const comments = await listComments(req.params.id);
    res.json(comments);
});

router.post("/:id/comments", async (req, res) => {
    const comment = await createComment(req.params.id, req.body);
    res.status(201).json(comment);
});

router.post("/:id/vote", async (req, res) => {
    const result = await voteLink(req.params.id, req.body);
    res.json(result);
});

router.get("/:id", async (req, res) => {
    const link = await getLink(req.params.id);
    res.json(link);
});

export default router;
