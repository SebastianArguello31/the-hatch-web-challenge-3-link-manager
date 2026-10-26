import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import LinkContent from "../components/LinkContent.jsx";
import VoteControls from "../components/VoteControls.jsx";
import CommentList from "../components/CommentList.jsx";
import CommentForm from "../components/CommentForm.jsx";

import { getLink, getComments } from "../services/api.js";

export default function LinkDetailPage() {
    // Obtiene el parámetro :id de la ruta /links/:id.
    const { id } = useParams();

    // Una key diferente reinicia el detalle y sus formularios al cambiar de enlace.
    return <LinkDetail key={id} linkId={id} />;
}

function LinkDetail({ linkId }) {
    // Cada estado representa un dato visible: enlace, comentarios, carga y error.
    const [link, setLink] = useState(null);
    const [comments, setComments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Consulta la API para el enlace recibido mediante props.
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

        // Evita aplicar respuestas pendientes después de abandonar este detalle.
        return () => {
            active = false;
        };
    }, [linkId]);

    function handleCommentCreated(comment) {
        // Copia la lista anterior y añade la respuesta del servidor sin mutar el estado.
        setComments((previousComments) => [
            ...previousComments,
            comment,
        ]);
    }

    function handleScoreChange(score) {
        // Conserva los datos del enlace y reemplaza solo la puntuación confirmada.
        setLink((previousLink) => ({
            ...previousLink,
            score,
        }));
    }

    // Estas salidas impiden leer link.title antes de que exista un enlace cargado.
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
