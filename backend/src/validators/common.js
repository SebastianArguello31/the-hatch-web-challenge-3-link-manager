// El middleware usa status para responder con el código HTTP adecuado.
export function validationError(message) {
    const error = new Error(message);
    error.status = 400;
    return error;
}

// Error común para operaciones sobre un enlace inexistente.
export function notFoundError() {
    const error = new Error("El enlace solicitado no existe.");
    error.status = 404;
    return error;
}

// Los parámetros de la URL son texto: exige un entero positivo que quepa en INTEGER.
export function parseLinkId(value) {
    const id = Number(value);

    if (
        typeof value !== "string"
        || !/^[1-9]\d*$/.test(value)
        || !Number.isSafeInteger(id)
        || id > 2147483647
    ) {
        throw validationError(
            "El identificador debe ser un entero positivo válido."
        );
    }

    return id;
}

// Rechaza cuerpos ausentes, null y arreglos antes de acceder a sus campos.
export function requireObject(value) {
    if (
        value === null
        || typeof value !== "object"
        || Array.isArray(value)
    ) {
        throw validationError("Debes enviar un objeto JSON.");
    }

    return value;
}

// Recorta espacios, aplica los límites y rechaza el carácter nulo que PostgreSQL no admite.
// required=false permite textos vacíos, como la descripción opcional.
export function readText(value, label, maxLength, required = true) {
    if (typeof value !== "string" || value.includes("\u0000")) {
        throw validationError(`${label} debe ser un texto válido.`);
    }

    const text = value.trim();

    if (required && !text) {
        throw validationError(`${label} es obligatorio.`);
    }

    if (text.length > maxLength) {
        throw validationError(
            `${label} no puede superar los ${maxLength} caracteres.`
        );
    }

    return text;
}
