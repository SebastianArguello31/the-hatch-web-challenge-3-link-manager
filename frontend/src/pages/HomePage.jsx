import { useEffect, useState } from "react";

import LinkCard from "../components/LinkCard.jsx";
import LinkForm from "../components/LinkForm.jsx";
import TagFilter from "../components/TagFilter.jsx";

import { getLinks, getTags } from "../services/api.js";

export default function HomePage() {
    const [selectedTag, setSelectedTag] = useState("");
    const [revision, setRevision] = useState(0);
    const [notice, setNotice] = useState("");

    const [result, setResult] = useState({
        links: [],
        tags: [],
        error: "",
        tag: null,
        revision: -1,
    });

    const loading = (result.tag !== selectedTag || result.revision !== revision);

    useEffect(() => {
        const controller = new AbortController();

        async function loadData() {
            try {
                const [links, tags] = await Promise.all([
                    getLinks(selectedTag, controller.signal),
                    getTags(controller.signal),
                ]);

                if (controller.signal.aborted) {
                    return;
                }

                setResult({
                    links,
                    tags,
                    error: "",
                    tag: selectedTag,
                    revision,
                });
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                setResult((previous) => ({
                    ...previous,
                    links: [],
                    error: error.message,
                    tag: selectedTag,
                    revision,
                }));
            }
        }

        loadData();

        return () => {
            controller.abort();
        };
    }, [selectedTag, revision]);

    function handleFilterChange(tag) {
        setNotice("");
        setSelectedTag(tag);
    }

    function handleCreated() {
        setNotice("Enlace guardado.");
        setSelectedTag("");
        setRevision((previous) => previous + 1);
    }

    function retryLoading() {
        setRevision((previous) => previous + 1);
    }

    return (
        <section>
            <h1>Mis enlaces</h1>

            <p role="status" aria-live="polite">
                {notice}
            </p>

            <LinkForm onCreated={handleCreated} />

            <section aria-labelledby="list-title">
                <h2 id="list-title">Recursos guardados</h2>

                <TagFilter
                    tags={result.tags}
                    value={selectedTag}
                    onChange={handleFilterChange}
                    disabled={loading && result.tags.length === 0}
                />

                <div aria-busy={loading}>
                    {loading ? (
                        <p role="status">Cargando enlaces…</p>
                    ) : result.error ? (
                        <div>
                            <p role="alert">{result.error}</p>
                            <button type="button" onClick={retryLoading}>Reintentar carga</button>
                        </div>
                    ) : result.links.length === 0 ? (
                        <p>
                            {selectedTag
                                ? "No hay enlaces con esta etiqueta."
                                : "Todavía no hay enlaces. Guarda el primero."}
                        </p>
                    ) : (
                        <div className="card-grid">
                            {result.links.map((link) => (
                                <LinkCard key={link.id} link={link} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </section>
    );
}