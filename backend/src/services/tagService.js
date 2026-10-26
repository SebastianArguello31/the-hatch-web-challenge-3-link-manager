import { findAllTags } from "../repositories/tagRepository.js";

export async function listTags() {
    return findAllTags();
}