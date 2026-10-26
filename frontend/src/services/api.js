// Vite incorpora esta variable al compilar; se quitan barras finales para unir las rutas.
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/+$/, "");

// Centraliza Fetch, la conversión JSON y los errores para todos los componentes.
// signal es opcional y permite cancelar una petición desde quien la inicia.
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

        throw new Error(
            "No se pudo conectar con el servidor. Comprueba que esté iniciado.",
            { cause: error }
        );
    }

    const data = await response.json().catch(() => null);

    // Fetch no lanza un error por estados HTTP como 400 o 500: hay que comprobarlos.
    if (!response.ok) {
        throw new Error(
            typeof data?.error === "string"
                ? data.error
                : `La petición falló (${response.status}).`
        );
    }

    if (data === null) {
        throw new Error("El servidor devolvió una respuesta inesperada.");
    }

    return data;
}

// URLSearchParams codifica la etiqueta para que espacios y símbolos no rompan la URL.
export function getLinks(tag = "", signal) {
    const query = tag
        ? `?${new URLSearchParams({ tag }).toString()}`
        : "";

    return request(`/links${query}`, { signal });
}

// Los identificadores se codifican al incorporarlos como segmentos de la ruta.
export function getLink(id, signal) {
    return request(`/links/${encodeURIComponent(id)}`, { signal });
}

// Opciones disponibles para el filtro del listado.
export function getTags(signal) {
    return request("/tags", { signal });
}

// Los POST envían los datos como JSON y devuelven la respuesta del backend.
export function createLink(data) {
    return request("/links", {
        method: "POST",
        body: data,
    });
}

// Consulta los comentarios de un enlace concreto.
export function getComments(linkId, signal) {
    return request(
        `/links/${encodeURIComponent(linkId)}/comments`,
        { signal }
    );
}

// Devuelve el comentario guardado para añadirlo al estado de la página.
export function createComment(linkId, data) {
    return request(`/links/${encodeURIComponent(linkId)}/comments`, {
        method: "POST",
        body: data,
    });
}

// Envía +1 o -1; la respuesta contiene la puntuación total confirmada.
export function voteLink(linkId, value) {
    return request(`/links/${encodeURIComponent(linkId)}/vote`, {
        method: "POST",
        body: { value },
    });
}
