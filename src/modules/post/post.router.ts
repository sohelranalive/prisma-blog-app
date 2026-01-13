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
router.patch(
  "/:postId",
  authentication("USER", "ADMIN"),
  postController.updatePost
);
router.delete(
  "/:postId",
  authentication("USER", "ADMIN"),
  postController.deletePost
);
router.get("/:postId", postController.getPostById);
router.post("/", authentication("USER", "ADMIN"), postController.createPost);

export const postRouter = router;
