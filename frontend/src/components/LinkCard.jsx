import { Link } from "react-router-dom";
import LinkContent from "./LinkContent.jsx";

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