// textContent muestra texto sin interpretar como HTML lo que provenga del usuario.
export function showError(element, message) {
    element.textContent = message;
    element.hidden = false;
}

// Limpia el mensaje anterior antes de intentar otra operación.
export function clearError(element) {
    element.textContent = "";
    element.hidden = true;
}

// Desactiva el envío y cambia su texto mientras una operación está pendiente.
export function setFormBusy(form, busy, busyLabel, normalLabel) {
    const button = form.querySelector('button[type="submit"]');

    button.disabled = busy;
    button.textContent = busy ? busyLabel : normalLabel;
}

// Quita primero la URL anterior y solo activa destinos HTTP/HTTPS válidos.
export function setExternalUrl(anchor, url) {
    anchor.removeAttribute("href");
    anchor.textContent = "URL no disponible";

    try {
        const parsed = new URL(url);

        if (!["http:", "https:"].includes(parsed.protocol)) {
            return;
        }

        anchor.href = parsed.href;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = "Visitar recurso ↗";
    } catch {
        // Se mantiene el enlace desactivado cuando la URL es inválida.
    }
}

// Sustituye las etiquetas visibles para no acumular elementos al cambiar de enlace.
export function fillTags(list, tags) {
    list.replaceChildren();

    for (const tag of tags) {
        const item = document.createElement("li");
        item.textContent = tag;
        list.append(item);
    }
}
