import { Link } from "react-router-dom";

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

export default function LinkCard({ link }) {
    const externalUrl = getSafeUrl(link.url);

    return (
        <article className="link-card">
            <h3>
                <Link to={`/links/${link.id}`}>{link.title}</Link>
            </h3>

            <p className="link-description">
                {link.description || "Sin descripción."}
            </p>

            <ul className="tag-list" aria-label="Etiquetas">
                {link.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                ))}
            </ul>

            <p className="card-meta">
                Puntuación: {link.score}
            </p>

            {externalUrl && (
                <a href={externalUrl} target="_blank" rel="noopener noreferrer">Visitar recurso ↗</a>
            )}
        </article>
    );
}