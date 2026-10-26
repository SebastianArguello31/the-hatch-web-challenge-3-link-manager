import { findCommentsByLinkId, insertComment, } from "../repositories/commentRepository.js";
import { getLink } from "./linkService.js";

function validationError(message) {
    const error = new Error(message);
    error.status = 400;
    return error;
}

export async function listComments(linkId) {
    await getLink(linkId);

    return findCommentsByLinkId(linkId);
}

export async function createComment(linkId, { author, content }) {
    if (typeof author !== "string" || !author.trim()) {
        throw validationError("El nombre del autor es obligatorio.");
    }

    if (author.trim().length > 100) {
        throw validationError("El nombre del autor no puede superar los 100 caracteres.");
    }

    if (typeof content !== "string" || !content.trim()) {
        throw validationError("El comentario no puede estar vacío.");
    }

    await getLink(linkId);

    return insertComment({
        linkId,
        author: author.trim(),
        content: content.trim(),
    });
}