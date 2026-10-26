import { Router } from "express";
import { listLinks, getLink, createLink, voteLink, } from "../services/linkService.js";
import { listComments, createComment, } from "../services/commentService.js";

const router = Router();

router.get("/", async (req, res) => {
    const links = await listLinks(req.query.tag);
    res.json(links);
});

router.post("/", async (req, res) => {
    const link = await createLink(req.body);

    res.status(201)
        .location(`/api/links/${link.id}`)
        .json(link);
});

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