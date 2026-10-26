import { Router } from "express";
import { list, detail, create, } from "../controllers/linkController.js";

const router = Router();

router.get("/", list);
router.get("/:id", detail);
router.post("/", create);

export default router;