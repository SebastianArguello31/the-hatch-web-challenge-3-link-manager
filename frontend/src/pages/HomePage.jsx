import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LinkCard from "../components/LinkCard.jsx";
import LinkForm from "../components/LinkForm.jsx";
import TagFilter from "../components/TagFilter.jsx";

import { getLinks, getTags } from "../services/api.js";

export default function HomePage() {
    const navigate = useNavigate();

    const [links, setLinks] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadLinks() {
            setLoading(true);
            setError("");

            try {
                const loadedLinks = await getLinks(selectedTag);
                const loadedTags = await getTags();

                if (active) {
                    setLinks(loadedLinks);
                    setTags(loadedTags);
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

        loadLinks();

        return () => {
            active = false;
        };
    }, [selectedTag]);

    function handleFilterChange(tag) {
        setLoading(true);
        setSelectedTag(tag);
    }

    function handleCreated(link) {
        navigate(`/links/${link.id}`);
    }

    return (
        <section>
            <h1>Mis enlaces</h1>

            <LinkForm onCreated={handleCreated} />

            <section aria-labelledby="list-title">
                <h2 id="list-title">Recursos guardados</h2>

                <TagFilter tags={tags} value={selectedTag} onChange={handleFilterChange} disabled={loading}/>

                <div aria-busy={loading}>
                    {loading && (<p role="status">Cargando enlaces…</p>)}

                    {!loading && error && (<p role="alert">{error}</p>)}

                    {!loading && !error && links.length === 0 && (<p>No hay enlaces para mostrar.</p>)}

                    {!loading && !error && links.length > 0 && (
                        <div className="card-grid">
                            {links.map((link) => (
                                <LinkCard key={link.id} link={link}/>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </section>
    );
}