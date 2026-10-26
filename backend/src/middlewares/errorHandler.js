// Express reconoce un manejador de errores por estos cuatro parámetros.
// Unifica las respuestas y oculta los detalles internos de los errores 500.
export function errorHandler(error, req, res, next) {
    // No se puede enviar otra respuesta si la primera ya comenzó.
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

    // Solo expone mensajes de errores de cliente; los demás se tratan como internos.
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
