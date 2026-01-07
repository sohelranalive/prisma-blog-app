import { Request, Response } from "express";
import { commentService } from "./comment.service";

const postComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    req.body.authorId = user?.id;
    const result = await commentService.postComment(req.body);

    res.status(201).json({
      message: "You just made a comment",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getCommentsByAuthor = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;
    const result = await commentService.getCommentsByAuthor(authorId as string);

    res.status(200).json({
      message: "Retrieved all the comments by authorId",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getCommentById = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await commentService.getCommentById(commentId as string);

    res.status(200).json({
      message: "Retrieved the comment",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { commentId } = req.params;
    const result = await commentService.deleteComment(
      user?.id as string,
      commentId as string
    );

    res.status(200).json({
      message: "Comment Deleted",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { commentId } = req.params;
    const data = req.body;
    const result = await commentService.updateComment(
      user?.id as string,
      commentId as string,
      data
    );

    res.status(201).json({
      message: "Comment Updated",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const commentController = {
  postComment,
  getCommentById,
  getCommentsByAuthor,
  deleteComment,
  updateComment,
};
