export function validationError(message) {
    const error = new Error(message);
    error.status = 400;
    return error;
}

export function notFoundError() {
    const error = new Error("El enlace solicitado no existe.");
    error.status = 404;
    return error;
}

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