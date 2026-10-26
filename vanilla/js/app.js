import { getLinks, getLink, getTags, createLink, getComments, createComment, voteLink, } from "./api.js";

const elements = {
    home: document.querySelector("#home-view"),
    detail: document.querySelector("#detail-view"),
    homeTitle: document.querySelector("#home-title"),
    status: document.querySelector("#page-status"),
    error: document.querySelector("#page-error"),
    linkForm: document.querySelector("#link-form"),
    linkFormError: document.querySelector("#link-form-error"),
    filter: document.querySelector("#tag-filter"),
    links: document.querySelector("#link-list"),
    detailTitle: document.querySelector("#detail-title"),
    detailUrl: document.querySelector("#detail-url"),
    description: document.querySelector("#detail-description"),
    tags: document.querySelector("#detail-tags"),
    score: document.querySelector("#detail-score"),
    positive: document.querySelector("#vote-positive"),
    negative: document.querySelector("#vote-negative"),
    voteError: document.querySelector("#vote-error"),
    comments: document.querySelector("#comment-list"),
    commentForm: document.querySelector("#comment-form"),
    commentError: document.querySelector("#comment-form-error"),
};

let viewController;
let viewVersion = 0;
let currentLinkId = null;
let savingLink = false;
let savingComment = false;
let savingVote = false;

function showError(element, message) {
    element.textContent = message;
    element.hidden = false;
}

function clearError(element) {
    element.textContent = "";
    element.hidden = true;
}

function setFormBusy(form, busy, busyLabel, normalLabel) {
    const button = form.querySelector('button[type="submit"]');

    button.disabled = busy;
    button.textContent = busy ? busyLabel : normalLabel;
}

function updateDetailButtons() {
    const unavailable = currentLinkId === null;

    elements.positive.disabled = unavailable || savingVote;
    elements.negative.disabled = unavailable || savingVote;

    setFormBusy(
        elements.commentForm,
        unavailable || savingComment,
        savingComment ? "Publicando…" : "Publicar comentario",
        "Publicar comentario"
    );
}

function setExternalUrl(anchor, url) {
    anchor.removeAttribute("href");

    try {
        const parsed = new URL(url);

        if (!["http:", "https:"].includes(parsed.protocol)) {
            throw new Error("Protocolo no permitido.");
        }

        anchor.href = parsed.href;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = "Visitar recurso ↗";
    } catch {
        anchor.textContent = "URL no disponible";
    }
}

function fillTags(list, tags) {
    list.replaceChildren();

    for (const tag of tags) {
        const item = document.createElement("li");
        item.textContent = tag;
        list.append(item);
    }
}

function renderLinks(links) {
    elements.links.replaceChildren();

    if (links.length === 0) {
        const message = document.createElement("p");

        message.textContent = elements.filter.value
            ? "No hay enlaces con esta etiqueta."
            : "Todavía no hay enlaces. Guarda el primero.";

        elements.links.append(message);
        return;
    }

    for (const link of links) {
        const card = document.createElement("article");
        card.className = "link-card";

        const title = document.createElement("h3");
        const detailLink = document.createElement("a");
        detailLink.href = `#/links/${link.id}`;
        detailLink.textContent = link.title;
        title.append(detailLink);

        const description = document.createElement("p");
        description.className = "link-description";
        description.textContent = link.description || "Sin descripción.";

        const tags = document.createElement("ul");
        tags.className = "tag-list";
        fillTags(tags, link.tags);

        const score = document.createElement("p");
        score.className = "card-meta";
        score.textContent = `Puntuación: ${link.score}`;

        const externalLink = document.createElement("a");
        setExternalUrl(externalLink, link.url);

        card.append(title, description, tags, score, externalLink);
        elements.links.append(card);
    }
}

function renderTagFilter(tags, selectedTag) {
    const all = document.createElement("option");
    all.value = "";
    all.textContent = "Todas las etiquetas";

    elements.filter.replaceChildren(all);

    for (const tag of tags) {
        const option = document.createElement("option");
        option.value = tag.name;
        option.textContent = tag.name;
        elements.filter.append(option);
    }

    elements.filter.value = tags.some((tag) => tag.name === selectedTag) ? selectedTag : "";
}

function renderComments(comments) {
    elements.comments.replaceChildren();

    if (comments.length === 0) {
        const item = document.createElement("li");
        item.textContent = "Todavía no hay comentarios.";
        elements.comments.append(item);
        return;
    }

    for (const comment of comments) {
        const item = document.createElement("li");

        const author = document.createElement("strong");
        author.textContent = comment.author;

        const date = document.createElement("time");
        date.dateTime = comment.created_at;
        date.textContent = new Date(comment.created_at).toLocaleString("es");

        const content = document.createElement("p");
        content.textContent = comment.content;

        item.append(author, document.createTextNode(" · "), date, content);
        elements.comments.append(item);
    }
}

function renderDetail(link, comments) {
    elements.detailTitle.textContent = link.title;
    elements.description.textContent = link.description || "Sin descripción.";
    elements.score.textContent = link.score;

    setExternalUrl(elements.detailUrl, link.url);
    fillTags(elements.tags, link.tags);
    renderComments(comments);
}

function isCurrentView(version) {
    return version === viewVersion;
}

async function showRoute({ focus = true } = {}) {
    viewController?.abort();

    const controller = new AbortController();
    viewController = controller;

    const version = ++viewVersion;
    const hash = window.location.hash || "#/";
    const detailMatch = /^#\/links\/([1-9]\d*)$/.exec(hash);

    currentLinkId = null;
    elements.home.hidden = true;
    elements.detail.hidden = true;
    elements.links.replaceChildren();
    elements.filter.disabled = true;

    clearError(elements.error);
    clearError(elements.linkFormError);
    clearError(elements.commentError);
    clearError(elements.voteError);

    updateDetailButtons();
    elements.status.textContent = "Cargando…";

    try {
        if (hash === "#/") {
            elements.home.hidden = false;

            const selectedTag = elements.filter.value;

            const [tags, links] = await Promise.all([
                getTags(controller.signal),
                getLinks(selectedTag, controller.signal),
            ]);

            if (!isCurrentView(version)) {
                return;
            }

            renderTagFilter(tags, selectedTag);
            renderLinks(links);
            elements.status.textContent = `${links.length} enlace(s) encontrado(s).`;

            if (focus) {
                elements.homeTitle.focus();
            }

            return;
        }

        if (!detailMatch) {
            throw new Error("La página solicitada no existe.");
        }

        const id = Number(detailMatch[1]);

        if (!Number.isSafeInteger(id) || id > 2147483647) {
            throw new Error("El identificador del enlace no es válido.");
        }

        const [link, comments] = await Promise.all([
            getLink(id, controller.signal),
            getComments(id, controller.signal),
        ]);

        if (!isCurrentView(version)) {
            return;
        }

        currentLinkId = id;
        elements.commentForm.reset();

        renderDetail(link, comments);

        elements.detail.hidden = false;
        elements.status.textContent = "";

        if (focus) {
            elements.detailTitle.focus();
        }
    } catch (error) {
        if (!isCurrentView(version) || error.name === "AbortError") {
            return;
        }

        elements.status.textContent = "";
        showError(elements.error, error.message);
    } finally {
        if (isCurrentView(version)) {
            elements.filter.disabled = false;
            updateDetailButtons();
        }
    }
}

async function handleCreateLink(event) {
    event.preventDefault();

    if (savingLink) {
        return;
    }

    clearError(elements.linkFormError);

    const formData = new FormData(elements.linkForm);
    const data = {
        title: formData.get("title").trim(),
        url: formData.get("url").trim(),
        description: formData.get("description").trim(),
        tags: formData.get("tags").split(",").map((tag) => tag.trim()),
    };

    if (data.tags.some((tag) => !tag)) {
        showError(elements.linkFormError, "Escribe etiquetas separadas por comas, sin elementos vacíos.");
        return;
    }

    const version = viewVersion;
    savingLink = true;

    setFormBusy(elements.linkForm, true, "Guardando…", "Guardar enlace");

    try {
        await createLink(data);
        elements.linkForm.reset();

        if (!isCurrentView(version)) {
            return;
        }

        elements.filter.value = "";
        await showRoute({ focus: false });

        if (!elements.home.hidden) {
            elements.status.textContent = elements.error.hidden
                ? "Enlace guardado. Listado actualizado."
                : "Enlace guardado, pero no se pudo actualizar el listado.";
        }
    } catch (error) {
        if (isCurrentView(version)) {
            showError(elements.linkFormError, error.message);
        }
    } finally {
        savingLink = false;
        setFormBusy(elements.linkForm, false, "Guardando…", "Guardar enlace");
    }
}

async function handleCreateComment(event) {
    event.preventDefault();

    if (savingComment || currentLinkId === null) {
        return;
    }

    clearError(elements.commentError);

    const version = viewVersion;
    const linkId = currentLinkId;
    const formData = new FormData(elements.commentForm);

    const data = {
        author: formData.get("author").trim(),
        content: formData.get("content").trim(),
    };

    savingComment = true;
    updateDetailButtons();

    try {
        await createComment(linkId, data);
    } catch (error) {
        if (isCurrentView(version)) {
            showError(elements.commentError, error.message);
        }

        return;
    } finally {
        savingComment = false;
        updateDetailButtons();
    }

    if (!isCurrentView(version)) {
        return;
    }

    elements.commentForm.reset();
    elements.status.textContent = "Comentario guardado.";

    try {
        const comments = await getComments(linkId, viewController.signal);

        if (isCurrentView(version)) {
            renderComments(comments);
        }
    } catch (error) {
        if (isCurrentView(version) && error.name !== "AbortError") {
            showError(elements.commentError, `El comentario se guardó, pero no se pudo actualizar la lista. ${error.message}`);
        }
    }
}

async function handleVote(value) {
    if (savingVote || currentLinkId === null) {
        return;
    }

    clearError(elements.voteError);

    const version = viewVersion;
    const linkId = currentLinkId;

    savingVote = true;
    updateDetailButtons();

    try {
        const result = await voteLink(linkId, value);

        if (isCurrentView(version)) {
            elements.score.textContent = result.score;
            elements.status.textContent = "Voto registrado.";
        }
    } catch (error) {
        if (isCurrentView(version)) {
            showError(elements.voteError, error.message);
        }
    } finally {
        savingVote = false;
        updateDetailButtons();
    }
}

elements.linkForm.addEventListener("submit", handleCreateLink);
elements.commentForm.addEventListener("submit", handleCreateComment);
elements.filter.addEventListener("change", () => { showRoute({ focus: false }); });
elements.positive.addEventListener("click", () => handleVote(1));
elements.negative.addEventListener("click", () => handleVote(-1));

window.addEventListener("hashchange", () => showRoute());

showRoute({ focus: false });