export function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error.type === "entity.parse.failed") {
        return res.status(400).json({
            error: "El cuerpo de la petición debe contener JSON válido.",
        });
    }

    if (error.type === "entity.too.large") {
        return res.status(413).json({
            error: "La petición supera el tamaño permitido.",
        });
    }

    const status = Number.isInteger(error.status)
        && error.status >= 400
        && error.status < 500
        ? error.status
        : 500;

    if (status === 500) {
        console.error("Error interno:", error);
    }

    return res.status(status).json({
        error: status === 500
            ? "Ocurrió un error interno en el servidor."
            : error.message,
    });
}