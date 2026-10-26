import { listLinks, getLink, createLink, voteLink, } from "../services/linkService.js";

export async function list(req, res) {
    const links = await listLinks(req.query.tag);
    res.json(links);
}

export async function detail(req, res) {
    const link = await getLink(req.params.id);
    res.json(link);
}

export async function create(req, res) {
    const link = await createLink(req.body);

    res.status(201)
        .location(`/api/links/${link.id}`)
        .json(link);
}

export async function vote(req, res) {
    const result = await voteLink(req.params.id, req.body);
    res.json(result);
}