import { Router } from "express";
import { findAllTags } from "../repositories/tagRepository.js";

const router = Router();

router.get("/", async (req, res) => {
    const tags = await findAllTags();
    res.json(tags);
});

export default router;