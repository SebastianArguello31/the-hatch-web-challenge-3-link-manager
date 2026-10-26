const API_BASE_URL = "http://localhost:3000/api";

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
        if (error.name === "AbortError") {
            throw error;
        }

        throw new Error("No se pudo conectar con el servidor. Comprueba que esté iniciado.");
    }

    const data = await response.json().catch(() => null);

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

export function getLinks(tag = "", signal) {
    const query = tag
        ? `?${new URLSearchParams({ tag }).toString()}`
        : "";

    return request(`/links${query}`, { signal });
}

export function getLink(id, signal) {
    return request(`/links/${encodeURIComponent(id)}`, { signal });
}

export function getTags(signal) {
    return request("/tags", { signal });
}

export function createLink(data) {
    return request("/links", {
        method: "POST",
        body: data,
    });
}

export function getComments(linkId, signal) {
    return request(
        `/links/${encodeURIComponent(linkId)}/comments`,
        { signal }
    );
}

export function createComment(linkId, data) {
    return request(`/links/${encodeURIComponent(linkId)}/comments`, {
        method: "POST",
        body: data,
    });
}

export function voteLink(linkId, value) {
    return request(`/links/${encodeURIComponent(linkId)}/vote`, {
        method: "POST",
        body: { value },
    });
}