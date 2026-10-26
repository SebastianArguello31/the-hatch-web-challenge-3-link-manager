import { listComments, createComment, } from "../services/commentService.js";
import { parseLinkId } from "./parseLinkId.js";

export async function list(req, res, next) {
    try {
        const linkId = parseLinkId(req.params.id);
        const comments = await listComments(linkId);

        res.json(comments);
    } catch (error) {
        next(error);
    }
}

export async function create(req, res, next) {
    try {
        const linkId = parseLinkId(req.params.id);

        if (req.body === null || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                error: "Debes enviar un objeto JSON con los datos del comentario.",
            });
        }

        const comment = await createComment(linkId, req.body);

        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
}