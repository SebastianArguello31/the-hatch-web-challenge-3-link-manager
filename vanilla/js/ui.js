export function showError(element, message) {
    element.textContent = message;
    element.hidden = false;
}

export function clearError(element) {
    element.textContent = "";
    element.hidden = true;
}

export function setFormBusy(form, busy, busyLabel, normalLabel) {
    const button = form.querySelector('button[type="submit"]');

    button.disabled = busy;
    button.textContent = busy ? busyLabel : normalLabel;
}

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

export function fillTags(list, tags) {
    list.replaceChildren();

    for (const tag of tags) {
        const item = document.createElement("li");
        item.textContent = tag;
        list.append(item);
    }
}