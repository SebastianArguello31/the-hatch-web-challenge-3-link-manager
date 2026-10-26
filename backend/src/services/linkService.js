import { findAllLinks, findLinkById, insertLinkWithTags, updateLinkScore, } from "../repositories/linkRepository.js";
import { validationError, notFoundError, parseLinkId, requireObject, readText, } from "../validators/common.js";

// Valida la entrada antes de guardar y normaliza espacios, URL y etiquetas.
function normalizeLink(data) {
    const body = requireObject(data);

    const title = readText(body.title, "El título", 200);
    const url = readText(body.url, "La URL", 2048);
    const description = readText(body.description ?? "", "La descripción", 5000, false);

    let parsedUrl;

    try {
        parsedUrl = new URL(url);
    } catch {
        throw validationError("La URL no tiene un formato válido.");
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw validationError("La URL debe utilizar HTTP o HTTPS.");
    }

    if (!Array.isArray(body.tags) || body.tags.length === 0) {
        throw validationError("Debes introducir al menos una etiqueta.");
    }

    // Normalizar antes de usar Set hace que React y react sean la misma etiqueta.
    const tags = body.tags.map((tag) =>
        readText(tag, "La etiqueta", 50).toLowerCase()
    );

    return {
        title,
        url: parsedUrl.href,
        description,
        tags: [...new Set(tags)],
    };
}

// Un filtro vacío equivale a listar todos los enlaces.
export async function listLinks(tag) {
    if (tag === undefined) {
        return findAllLinks();
    }

    const normalizedTag = readText(tag, "El filtro de etiqueta", 50, false).toLowerCase();

    return findAllLinks(normalizedTag || undefined);
}

// Centraliza la validación del ID y el error cuando el enlace no existe.
export async function getLink(rawId) {
    const id = parseLinkId(rawId);
    const link = await findLinkById(id);

    if (!link) {
        throw notFoundError();
    }

    return link;
}

// El repositorio recibe únicamente datos ya validados.
export async function createLink(data) {
    return insertLinkWithTags(normalizeLink(data));
}

// Solo admite votos numéricos de +1 o -1; el repositorio devuelve la nueva puntuación.
export async function voteLink(rawId, data) {
    const id = parseLinkId(rawId);
    const { value } = requireObject(data);

    if (value !== 1 && value !== -1) {
        throw validationError("El voto debe ser el número 1 o -1.");
    }

    const result = await updateLinkScore(id, value);

    if (!result) {
        throw notFoundError();
    }

    return result;
}
