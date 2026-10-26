import { listTags } from "../services/tagService.js";

export async function list(req, res, next) {
    try {
        const tags = await listTags();
        res.json(tags);
    } catch (error) {
        next(error);
    }
}