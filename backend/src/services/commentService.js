import { findCommentsByLinkId, insertComment, } from "../repositories/commentRepository.js";
import { getLink } from "./linkService.js";
import { requireObject, readText } from "../validators/common.js";

export async function listComments(rawId) {
    const link = await getLink(rawId);
    return findCommentsByLinkId(link.id);
}

export async function createComment(rawId, data) {
    const body = requireObject(data);

    const author = readText(body.author, "El nombre del autor", 100);
    const content = readText(body.content, "El comentario", 5000);

    const link = await getLink(rawId);

    return insertComment({
        linkId: link.id,
        author,
        content,
    });
}