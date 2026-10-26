import { Router } from "express";
import { list, detail, create, } from "../controllers/linkController.js";
import { list as listComments, create as createComment, } from "../controllers/commentController.js";

const router = Router();

router.get("/", list);
router.post("/", create);

router.get("/:id/comments", listComments);
router.post("/:id/comments", createComment);

router.get("/:id", detail);

export default router;