import { useRef, useState } from "react";
import { voteLink } from "../services/api.js";

// Recibe la puntuación del padre y le comunica el valor confirmado por el servidor.
export default function VoteControls({ linkId, score, onScoreChange, }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    // Impide iniciar otro voto mientras el anterior sigue pendiente.
    const submitting = useRef(false);

    // value es 1 o -1. La suma se realiza en PostgreSQL, no en el navegador.
    async function handleVote(value) {
        if (submitting.current) {
            return;
        }

        submitting.current = true;
        setSaving(true);
        setError("");
        setNotice("");

        let result;

        try {
            result = await voteLink(linkId, value);
        } catch (requestError) {
            setError(requestError.message);
            return;
        } finally {
            submitting.current = false;
            setSaving(false);
        }

        // Actualiza la pantalla solo cuando la API confirma el voto.
        onScoreChange(result.score);
        setNotice("Voto registrado.");
    }

    return (
        <section aria-label="Votaciones" aria-busy={saving}>
            <div className="vote-controls">
                <button type="button" onClick={() => handleVote(1)} disabled={saving}>
                    Votar +1
                </button>

                <p>
                    Puntuación: <strong>{score}</strong>
                </p>

                <button type="button" onClick={() => handleVote(-1)} disabled={saving}>
                    Votar −1
                </button>
            </div>

            <p className="card-meta">
                Los votos son anónimos. Una persona puede votar más de una vez.
            </p>

            {error && <p role="alert">{error}</p>}

            <p role="status" aria-live="polite">
                {saving
                    ? "Registrando voto…"
                    : notice && `${notice} Puntuación: ${score}.`}
            </p>
        </section>
    );
}
