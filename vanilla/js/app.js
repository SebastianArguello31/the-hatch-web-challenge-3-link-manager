import { getLinks, getTags, createLink, } from "./api.js";

const linkForm = document.querySelector("#link-form");
const tagFilter = document.querySelector("#tag-filter");
const linkList = document.querySelector("#link-list");
const pageStatus = document.querySelector("#page-status");
const pageError = document.querySelector("#page-error");
const linkFormError = document.querySelector("#link-form-error");

let listController;
let savingLink = false;

function showError(element, message) {
    element.textContent = message;
    element.hidden = false;
}

function clearError(element) {
    element.textContent = "";
    element.hidden = true;
}

function createTagList(tags) {
    const list = document.createElement("ul");
    list.className = "tag-list";

    for (const tag of tags) {
        const item = document.createElement("li");
        item.textContent = tag;
        list.append(item);
    }

    return list;
}

function createExternalLink(url, label) {
    const anchor = document.createElement("a");
    anchor.textContent = label;

    try {
        const parsedUrl = new URL(url);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            throw new Error("Protocolo no permitido.");
        }

        anchor.href = parsedUrl.href;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
    } catch {
        anchor.textContent = "URL no disponible";
    }

    return anchor;
}

function createLinkCard(link) {
    const card = document.createElement("article");
    card.className = "link-card";

    const title = document.createElement("h3");
    title.textContent = link.title;

    const description = document.createElement("p");
    description.className = "link-description";
    description.textContent = link.description || "Sin descripción.";

    const score = document.createElement("p");
    score.className = "card-meta";
    score.textContent = `Puntuación: ${link.score}`;

    const externalLink = createExternalLink(link.url, "Visitar recurso ↗");

    card.append(title, description, createTagList(link.tags), score, externalLink);

    return card;
}

function renderLinks(links) {
    linkList.replaceChildren();

    if (links.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.textContent = tagFilter.value
            ? "No hay enlaces con esta etiqueta."
            : "Todavía no hay enlaces. Guarda el primero.";

        linkList.append(emptyMessage);
        return;
    }

    const fragment = document.createDocumentFragment();

    for (const link of links) {
        fragment.append(createLinkCard(link));
    }

    linkList.append(fragment);
}

async function loadTags() {
    const tags = await getTags();
    const selectedTag = tagFilter.value;

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "Todas las etiquetas";

    tagFilter.replaceChildren(allOption);

    for (const tag of tags) {
        const option = document.createElement("option");
        option.value = tag.name;
        option.textContent = tag.name;
        tagFilter.append(option);
    }

    const selectionStillExists = tags.some(
        (tag) => tag.name === selectedTag
    );

    tagFilter.value = selectionStillExists ? selectedTag : "";
}

async function loadLinks() {
    listController?.abort();

    const controller = new AbortController();
    listController = controller;

    clearError(pageError);
    pageStatus.textContent = "Cargando enlaces…";
    linkList.setAttribute("aria-busy", "true");
    linkList.replaceChildren();

    try {
        const links = await getLinks(tagFilter.value, controller.signal);

        if (controller.signal.aborted) {
            return;
        }

        renderLinks(links);
        pageStatus.textContent = `${links.length} enlace(s) encontrado(s).`;
    } catch (error) {
        if (controller.signal.aborted) {
            return;
        }

        pageStatus.textContent = "";
        showError(pageError, error.message);
    } finally {
        if (listController === controller) {
            linkList.removeAttribute("aria-busy");
        }
    }
}

async function handleCreateLink(event) {
    event.preventDefault();

    if (savingLink) {
        return;
    }

    clearError(linkFormError);

    const formData = new FormData(linkForm);

    const data = {
        title: formData.get("title").trim(),
        url: formData.get("url").trim(),
        description: formData.get("description").trim(),
        tags: formData
            .get("tags")
            .split(",")
            .map((tag) => tag.trim()),
    };

    if (data.tags.some((tag) => tag === "")) {
        showError(linkFormError, "Escribe etiquetas separadas por comas, sin elementos vacíos.");
        return;
    }

    const submitButton = linkForm.querySelector('button[type="submit"]');

    savingLink = true;
    submitButton.disabled = true;
    submitButton.textContent = "Guardando…";

    try {
        await createLink(data);
    } catch (error) {
        showError(linkFormError, error.message);
        return;
    } finally {
        savingLink = false;
        submitButton.disabled = false;
        submitButton.textContent = "Guardar enlace";
    }

    linkForm.reset();
    tagFilter.value = "";

    try {
        await loadTags();
    } catch (error) {
        showError(linkFormError, `El enlace se guardó, pero no se actualizaron las etiquetas. ${error.message}`);
    }

    await loadLinks();

    if (pageError.hidden) {
        pageStatus.textContent = "Enlace guardado. Listado actualizado.";
    } else {
        pageStatus.textContent = "Enlace guardado.";
    }
}

async function initialize() {
    tagFilter.disabled = true;

    const tagsTask = loadTags()
        .catch((error) => {
            showError(pageError, `No se pudieron cargar las etiquetas. ${error.message}`);
        })
        .finally(() => {
            tagFilter.disabled = false;
        });

    await Promise.all([tagsTask, loadLinks()]);
}

linkForm.addEventListener("submit", handleCreateLink);
tagFilter.addEventListener("change", loadLinks);

initialize();