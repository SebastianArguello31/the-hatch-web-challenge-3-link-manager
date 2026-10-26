import { findAllLinks, findLinkById, insertLinkWithTags, } from "../repositories/linkRepository.js";

function validationError(message) {
    const error = new Error(message);
    error.status = 400;
    return error;
}

function normalizeLink({ title, url, description = "", tags }) {
    if (typeof title !== "string" || !title.trim()) {
        throw validationError("El título es obligatorio.");
    }

    if (title.trim().length > 200) {
        throw validationError("El título no puede superar los 200 caracteres.");
    }

    if (typeof url !== "string" || !url.trim()) {
        throw validationError("La URL es obligatoria.");
    }

    let parsedUrl;

    try {
        parsedUrl = new URL(url.trim());
    } catch {
        throw validationError("La URL no tiene un formato válido.");
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw validationError("La URL debe utilizar HTTP o HTTPS.");
    }

    if (typeof description !== "string") {
        throw validationError("La descripción debe ser un texto.");
    }

    if (!Array.isArray(tags) || tags.length === 0) {
        throw validationError("Debes introducir al menos una etiqueta.");
    }

    const normalizedTags = [];

    for (const tag of tags) {
        if (typeof tag !== "string" || !tag.trim()) {
            throw validationError("Las etiquetas deben ser textos no vacíos.");
        }

        const name = tag.trim().toLowerCase();

        if (name.length > 50) {
            throw validationError("Las etiquetas no pueden superar los 50 caracteres.");
        }

        normalizedTags.push(name);
    }

    return {
        title: title.trim(),
        url: parsedUrl.href,
        description: description.trim(),
        tags: [...new Set(normalizedTags)],
    };
}

export async function listLinks(tag) {
    if (tag === undefined) {
        return findAllLinks();
    }  

    if (typeof tag !== "string") {
        throw validationError("El filtro de etiqueta debe ser un texto.");
    }

    const normalizedTag = tag.trim().toLowerCase();

    if (normalizedTag.length > 50) {
        throw validationError("El filtro de etiqueta no puede superar los 50 caracteres.");
    }

    return findAllLinks(normalizedTag || undefined);
}

export async function getLink(id) {
    const link = await findLinkById(id);

    if (!link) {
        const error = new Error("El enlace solicitado no existe.");
        error.status = 404;
        throw error;
    }

    return link;
}

export async function createLink(data) {
    const normalizedLink = normalizeLink(data);

    return insertLinkWithTags(normalizedLink);
}