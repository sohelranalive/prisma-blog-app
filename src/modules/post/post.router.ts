import express from "express";
import { postController } from "./post.controller";
import authentication from "../../middleware/authentication";

const router = express.Router();

router.get("/", postController.getAllPost);
router.get("/:postId", postController.getPostById);
router.post("/", authentication("USER"), postController.createPost);

export const postRouter = router;
