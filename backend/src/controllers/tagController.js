import { listTags } from "../services/tagService.js";

export async function list(req, res) {
    const tags = await listTags();
    res.json(tags);
}