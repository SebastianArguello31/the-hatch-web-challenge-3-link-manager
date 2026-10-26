import { listLinks, getLink, createLink, } from "../services/linkService.js";
import { parseLinkId } from "./parseLinkId.js";

export async function list(req, res, next) {
    try {
        const links = await listLinks(req.query.tag);
        res.json(links);
    } catch (error) {
        next(error);
    }
}

export async function detail(req, res, next) {
    try {
        const id = parseLinkId(req.params.id);
        const link = await getLink(id);

        res.json(link);
    } catch (error) {
        next(error);
    }
}

export async function create(req, res, next) {
    try {
        if (req.body === null || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                error: "Debes enviar un objeto JSON con los datos del enlace.",
            });
        }

        const link = await createLink(req.body);

        res.status(201).location(`/api/links/${link.id}`).json(link);
    } catch (error) {
        next(error);
    }
}