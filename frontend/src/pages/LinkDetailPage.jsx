import { Link, useParams } from "react-router-dom";

export default function LinkDetailPage() {
    const { id } = useParams();

    return (
        <section>
            <Link to="/">← Volver al listado</Link>
            <h1>Detalle del enlace</h1>
            <p>Enlace seleccionado: {id}</p>
        </section>
    );
}