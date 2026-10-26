import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import LinkContent from "../components/LinkContent.jsx";
import VoteControls from "../components/VoteControls.jsx";
import CommentList from "../components/CommentList.jsx";
import CommentForm from "../components/CommentForm.jsx";

import { getLink, getComments } from "../services/api.js";

export default function LinkDetailPage() {
    const { id } = useParams();

    return <LinkDetail key={id} linkId={id} />;
}

function LinkDetail({ linkId }) {
    const [link, setLink] = useState(null);
    const [comments, setComments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadDetail() {
            try {
                const loadedLink = await getLink(linkId);
                const loadedComments = await getComments(linkId);

                if (active) {
                    setLink(loadedLink);
                    setComments(loadedComments);
                }
            } catch (error) {
                if (active) {
                    setError(error.message);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadDetail();

        return () => {
            active = false;
        };
    }, [linkId]);

    function handleCommentCreated(comment) {
        setComments((previousComments) => [
            ...previousComments,
            comment,
        ]);
    }

    function handleScoreChange(score) {
        setLink((previousLink) => ({
            ...previousLink,
            score,
        }));
    }

    if (loading) {
        return (
            <section>
                <Link to="/">← Volver al listado</Link>

                <h1>Detalle del enlace</h1>
                <p role="status">Cargando enlace…</p>
            </section>
        );
    }

    if (error) {
        return (
            <section>
                <Link to="/">← Volver al listado</Link>

                <h1>No se pudo cargar el enlace</h1>
                <p role="alert">{error}</p>
            </section>
        );
    }

    return (
        <section>
            <Link to="/">← Volver al listado</Link>

            <article className="panel">
                <h1>{link.title}</h1>

                <LinkContent link={link} />

                <p className="card-meta">
                    Guardado el{" "}
                    <time dateTime={link.created_at}>
                        {new Date(link.created_at).toLocaleString("es")}
                    </time>
                </p>

                <VoteControls linkId={link.id} score={link.score} onScoreChange={handleScoreChange} />
            </article>

            <section className="panel" aria-labelledby="comments-title">
                <h2 id="comments-title">Comentarios</h2>

                <CommentList comments={comments} />

                <h3>Añadir comentario</h3>

                <CommentForm linkId={link.id} onCreated={handleCommentCreated}/>
            </section>
        </section>
    );
}