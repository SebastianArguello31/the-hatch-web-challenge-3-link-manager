import { Link } from "react-router-dom";
import LinkContent from "./LinkContent.jsx";

// Recibe un enlace mediante props y muestra su resumen en el listado.
// Link abre el detalle; LinkContent reutiliza la descripción, etiquetas y URL.
export default function LinkCard({ link }) {
    return (
        <article className="link-card">
            <h3>
                <Link to={`/links/${link.id}`}>
                    {link.title}
                </Link>
            </h3>

            <LinkContent link={link} />

            <p className="card-meta">
                Puntuación: {link.score}
            </p>
        </article>
    );
}
