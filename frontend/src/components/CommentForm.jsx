import { useRef, useState } from "react";
import { createComment } from "../services/api.js";

// linkId indica dónde comentar; onCreated entrega el comentario guardado al padre.
export default function CommentForm({ linkId, onCreated }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    // La ref bloquea envíos repetidos; los estados controlan la interfaz y mensajes.
    const submitting = useRef(false);

    async function handleSubmit(event) {
        // Gestiona el envío con JavaScript para conservar la navegación SPA.
        event.preventDefault();

        if (submitting.current) {
            return;
        }

        const form = event.currentTarget;
        // Lee nombre y comentario directamente desde los campos del formulario.
        const formData = new FormData(form);

        const data = {
            author: formData.get("author").trim(),
            content: formData.get("content").trim(),
        };

        setError("");
        setNotice("");

        if (!data.author || !data.content) {
            setError("Introduce tu nombre y un comentario.");
            return;
        }

        submitting.current = true;
        setSaving(true);

        let comment;

        try {
            comment = await createComment(linkId, data);
        } catch (requestError) {
            setError(requestError.message);
            return;
        } finally {
            submitting.current = false;
            setSaving(false);
        }

        // El padre añade la respuesta a su lista sin volver a pedir todos los comentarios.
        form.reset();
        onCreated(comment);
        setNotice("Comentario publicado.");
    }

    return (
        <form onSubmit={handleSubmit} aria-busy={saving}>
            <label htmlFor="comment-author">Tu nombre</label>
            <input id="comment-author" name="author" type="text" maxLength={100} autoComplete="name" disabled={saving} required/>

            <label htmlFor="comment-content">Comentario</label>
            <textarea id="comment-content" name="content" rows={4} disabled={saving} required/>

            {error && <p role="alert">{error}</p>}

            <p role="status" aria-live="polite">
                {notice}
            </p>

            <button type="submit" disabled={saving}>
                {saving ? "Publicando…" : "Publicar comentario"}
            </button>
        </form>
    );
}
