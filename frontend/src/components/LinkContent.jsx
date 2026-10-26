// Solo permite enlaces externos HTTP/HTTPS; una URL inválida no se vuelve clicable.
function getSafeUrl(url) {
    try {
        const parsed = new URL(url);

        return ["http:", "https:"].includes(parsed.protocol)
            ? parsed.href
            : null;
    } catch {
        return null;
    }
}

// Contenido compartido entre la tarjeta del listado y la página de detalle.
export default function LinkContent({ link }) {
    const externalUrl = getSafeUrl(link.url);

    return (
        <>
            <p className="link-description">
                {link.description || "Sin descripción."}
            </p>

            <ul className="tag-list" aria-label="Etiquetas">
                {link.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                ))}
            </ul>

            {externalUrl && (
                <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Visitar recurso ↗
                </a>
            )}
        </>
    );
}
