import { Request, Response } from "express";
import { postService } from "./post.service";

const createPost = async (req: Request, res: Response) => {
  try {
    const result = await postService.createPost(
      req.body,
      req.user?.id as string
    );
    res.status(201).json({
      message: "Post Created Successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      message: "Post creation failed",
      error: error.message,
    });
  }
};

const getAllPost = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const searchString = typeof search === "string" ? search : undefined;
    const result = await postService.getAllPost({ search: searchString });
    res.status(200).json({
      message: "All posts retrieved Successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      message: "Post retrieved failed",
      error: error.message,
    });
  }
};

export const postController = {
  createPost,
  getAllPost,
};
