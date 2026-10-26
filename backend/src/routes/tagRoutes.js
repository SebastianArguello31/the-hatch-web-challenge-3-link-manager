import { Router } from "express";
import { list } from "../controllers/tagController.js";

const router = Router();

router.get("/", list);

export default router;