import express from "express";
import { commentController } from "./comment.controller";
import authentication from "../../middleware/authentication";

const router = express.Router();

router.get("/:commentId", commentController.getCommentById);

router.patch(
  "/:commentId",
  authentication("USER", "ADMIN"),
  commentController.updateComment
);

router.get("/author/:authorId", commentController.getCommentsByAuthor);

router.delete(
  "/:commentId",
  authentication("USER", "ADMIN"),
  commentController.deleteComment
);

router.post(
  "/",
  authentication("USER", "ADMIN"),
  commentController.postComment
);

export const commentRouter = router;
