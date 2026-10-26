import { listComments, createComment, } from "../services/commentService.js";

export async function list(req, res) {
    const comments = await listComments(req.params.id);
    res.json(comments);
}

export async function create(req, res) {
    const comment = await createComment(req.params.id, req.body);
    res.status(201).json(comment);
}