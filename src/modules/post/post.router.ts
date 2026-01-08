import express from "express";
import { postController } from "./post.controller";
import authentication from "../../middleware/authentication";

const router = express.Router();

router.get("/", postController.getAllPost);
router.get(
  "/myPost",
  authentication("USER", "ADMIN"),
  postController.getMyPost
);
router.get("/:postId", postController.getPostById);
router.post("/", authentication("USER", "ADMIN"), postController.createPost);

export const postRouter = router;
