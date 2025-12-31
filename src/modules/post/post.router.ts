import express from "express";
import { postController } from "./post.controller";
import authentication from "../../middleware/authentication";

const router = express.Router();

router.post("/", authentication("USER"), postController.createPost);
router.get("/", postController.getAllPost);
export const postRouter = router;
