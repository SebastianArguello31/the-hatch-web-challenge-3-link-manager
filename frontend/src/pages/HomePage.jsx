import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LinkCard from "../components/LinkCard.jsx";
import LinkForm from "../components/LinkForm.jsx";
import TagFilter from "../components/TagFilter.jsx";

import { getLinks, getTags } from "../services/api.js";

export default function HomePage() {
    // Permite abrir otra vista desde una función, sin recargar el navegador.
    const navigate = useNavigate();

    // useState conserva datos entre renderizados; sus setters actualizan la pantalla.
    const [links, setLinks] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState("");

    // Estos estados deciden si mostrar la carga, un error o los resultados.
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // El efecto carga los datos al entrar y cada vez que cambia selectedTag.
    useEffect(() => {
        // Cada carga tiene su propia bandera para descartar respuestas antiguas.
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

        // React ejecuta esta limpieza al salir o antes de cargar otro filtro.
        // La petición sigue, pero ya no puede actualizar esta vista.
        return () => {
            active = false;
        };
    }, [selectedTag]);

    function handleFilterChange(tag) {
        setLoading(true);
        setSelectedTag(tag);
    }

    function handleCreated(link) {
        // LinkForm entrega el enlace que acaba de guardar el backend.
        navigate(`/links/${link.id}`);
    }

    // En JSX, condición && contenido muestra ese contenido solo si se cumple.
    // map crea una tarjeta por enlace; key identifica cada tarjeta para React.
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
