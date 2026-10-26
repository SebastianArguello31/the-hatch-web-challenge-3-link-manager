// Ambas interfaces usan el mismo backend; cambia esta URL al publicar Vanilla.
const API_BASE_URL = "http://localhost:3000/api";

// Centraliza JSON y errores HTTP; signal permite cancelar cargas al cambiar de vista.
async function request(path, { method = "GET", body, signal } = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            signal,
            headers: body === undefined
                ? {}
                : { "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch (error) {
        // Una cancelación de navegación no debe mostrarse como un fallo de conexión.
        if (error.name === "AbortError") {
            throw error;
        }

        throw new Error("No se pudo conectar con el servidor. Comprueba que esté iniciado.");
    }

    const data = await response.json().catch(() => null);

    // Fetch también resuelve respuestas 400/500; aquí se convierten en errores.
    if (!response.ok) {
        const message = typeof data?.error === "string"
            ? data.error
            : `La petición falló (${response.status}).`;

        throw new Error(message);
    }

    if (data === null) {
        throw new Error("El servidor devolvió una respuesta inesperada.");
    }

    return data;
}

// Codifica el filtro para admitir espacios y caracteres especiales en las etiquetas.
export function getLinks(tag = "", signal) {
    const query = tag
        ? `?${new URLSearchParams({ tag }).toString()}`
        : "";

    return request(`/links${query}`, { signal });
}

// Consulta el detalle; encodeURIComponent mantiene el ID dentro de su segmento de URL.
export function getLink(id, signal) {
    return request(`/links/${encodeURIComponent(id)}`, { signal });
}

// Obtiene las opciones del selector de etiquetas.
export function getTags(signal) {
    return request("/tags", { signal });
}

// Envía los campos del formulario como JSON para guardar el enlace.
export function createLink(data) {
    return request("/links", {
        method: "POST",
        body: data,
    });
}

// Lista los comentarios asociados a un enlace.
export function getComments(linkId, signal) {
    return request(
        `/links/${encodeURIComponent(linkId)}/comments`,
        { signal }
    );
}

// Guarda un comentario y devuelve el registro creado por el servidor.
export function createComment(linkId, data) {
    return request(`/links/${encodeURIComponent(linkId)}/comments`, {
        method: "POST",
        body: data,
    });
}

// El servidor aplica +1 o -1 y devuelve la puntuación actualizada.
export function voteLink(linkId, value) {
    return request(`/links/${encodeURIComponent(linkId)}/vote`, {
        method: "POST",
        body: { value },
    });
}
