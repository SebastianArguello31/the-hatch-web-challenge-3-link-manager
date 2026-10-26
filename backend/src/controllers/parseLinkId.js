export function parseLinkId(rawId) {
    const id = Number(rawId);

    if (typeof rawId !== "string" || !/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(id) || id > 2147483647) {
        const error = new Error("El identificador debe ser un entero positivo válido.");

        error.status = 400;
        throw error;
    }

    return id;
}