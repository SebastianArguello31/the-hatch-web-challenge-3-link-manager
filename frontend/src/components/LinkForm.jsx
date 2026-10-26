import { useRef, useState } from "react";
import { createLink } from "../services/api.js";

export default function LinkForm({ onCreated }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const submitting = useRef(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (submitting.current) {
            return;
        }

        const form = event.currentTarget;
        const formData = new FormData(form);

        const data = {
            title: formData.get("title").trim(),
            url: formData.get("url").trim(),
            description: formData.get("description").trim(),
            tags: formData
                .get("tags")
                .split(",")
                .map((tag) => tag.trim()),
        };

        setError("");

        if (!data.title) {
            setError("El título es obligatorio.");
            return;
        }

        if (data.tags.some((tag) => !tag)) {
            setError("Escribe etiquetas separadas por comas, sin elementos vacíos.");
            return;
        }

        submitting.current = true;
        setSaving(true);

        let createdLink;

        try {
            createdLink = await createLink(data);
        } catch (requestError) {
            setError(requestError.message);
            return;
        } finally {
            submitting.current = false;
            setSaving(false);
        }

        form.reset();
        onCreated(createdLink);
    }

    return (
        <section className="panel" aria-labelledby="create-title">
            <h2 id="create-title">Guardar un enlace</h2>

            <form onSubmit={handleSubmit} aria-busy={saving}>
                <label htmlFor="link-title">Título</label>
                <input id="link-title" name="title" type="text" maxLength={200} disabled={saving} required/>

                <label htmlFor="link-url">URL</label>
                <input id="link-url" name="url" type="url" placeholder="https://ejemplo.com" disabled={saving} required/>

                <label htmlFor="link-description">Descripción (opcional)</label>
                <textarea id="link-description" name="description" rows={3} disabled={saving}/>

                <label htmlFor="link-tags">Etiquetas</label>
                <input id="link-tags" name="tags" type="text" aria-describedby="tags-help" disabled={saving} required/>

                <small id="tags-help">Sepáralas con comas. Ejemplo: javascript, react</small>

                {error && <p role="alert">{error}</p>}

                <button type="submit" disabled={saving}>
                    {saving ? "Guardando…" : "Guardar enlace"}
                </button>
            </form>
        </section>
    );
}