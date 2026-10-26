import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import CommentList from "../components/CommentList.jsx";
import CommentForm from "../components/CommentForm.jsx";
import VoteControls from "../components/VoteControls.jsx";

import { getLink, getComments } from "../services/api.js";

export default function LinkDetailPage() {
    const { id } = useParams();
    const linkId = Number(id);

    const validId = (/^[1-9]\d*$/.test(id ?? "") && Number.isSafeInteger(linkId) && linkId <= 2147483647);

    if (!validId) {
        return (
            <section>
                <h1>Enlace no válido</h1>
                <p role="alert">
                    El identificador debe ser un entero positivo válido.
                </p>
                <Link to="/">Volver al listado</Link>
            </section>
        );
    }

    return <LinkDetailContent key={linkId} linkId={linkId} />;
}

function LinkDetailContent({ linkId }) {
    const [revision, setRevision] = useState(0);

    const [result, setResult] = useState({
        link: null,
        comments: [],
        error: "",
        revision: -1,
    });

    const loading = result.revision !== revision;

    useEffect(() => {
        const controller = new AbortController();

        async function loadDetail() {
            try {
                const [link, comments] = await Promise.all([
                    getLink(linkId, controller.signal),
                    getComments(linkId, controller.signal),
                ]);

                if (controller.signal.aborted) {
                    return;
                }

                setResult({
                    link,
                    comments,
                    error: "",
                    revision,
                });
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                setResult({
                    link: null,
                    comments: [],
                    error: error.message,
                    revision,
                });
            }
        }

        loadDetail();

        return () => {
            controller.abort();
        };
    }, [linkId, revision]);

    function handleCommentCreated(comment) {
        setResult((previous) => ({
            ...previous,
            comments: [...previous.comments, comment],
        }));
    }

    function handleScoreChange(score) {
        setResult((previous) => ({
            ...previous,
            link: {
                ...previous.link,
                score,
            },
        }));
    }

    if (loading) {
        return (
            <section>
                <Link to="/">← Volver al listado</Link>
                <h1>Detalle del enlace</h1>
                <p role="status">Cargando enlace y comentarios…</p>
            </section>
        );
    }

    if (result.error) {
        return (
            <section>
                <Link to="/">← Volver al listado</Link>
                <h1>No se pudo cargar el enlace</h1>

                <p role="alert">{result.error}</p>

                <button type="button" onClick={() => setRevision((previous) => previous + 1)}>
                    Reintentar carga
                </button>
            </section>
        );
    }

    const { link, comments } = result;

    let externalUrl = null;

    try {
        const parsed = new URL(link.url);

        if (["http:", "https:"].includes(parsed.protocol)) {
            externalUrl = parsed.href;
        }
    } catch {
        externalUrl = null;
    }

    return (
        <section>
            <Link to="/">← Volver al listado</Link>

            <article className="panel">
                <h1>{link.title}</h1>

                {externalUrl && (
                    <a href={externalUrl} target="_blank" rel="noopener noreferrer">Visitar recurso ↗</a>
                )}

                <p className="link-description">
                    {link.description || "Sin descripción."}
                </p>

                <ul className="tag-list" aria-label="Etiquetas">
                    {link.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                    ))}
                </ul>

                <p className="card-meta">
                    Guardado el{" "}
                    <time dateTime={link.created_at}>
                        {new Date(link.created_at).toLocaleString("es")}
                    </time>
                </p>

                <VoteControls linkId={link.id} score={link.score} onScoreChange={handleScoreChange}/>
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