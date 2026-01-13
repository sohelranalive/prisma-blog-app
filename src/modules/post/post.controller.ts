import { Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationHelper from "../../helpers/paginationHelper";
import { error } from "node:console";
import { prisma } from "../../lib/prisma";

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

    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
        ? false
        : undefined
      : undefined;

    const status = req.query.status as PostStatus | undefined;

    const authorId = req.query.authorId as string | undefined;

    // const page = Number(req.query.page ?? 1);
    // const limit = Number(req.query.limit ?? 10);
    // const skip = (page - 1) * limit;

    // const sortBy = req.query.sortBy as string | undefined;
    // const sortOrder = req.query.sortOrder as string | undefined;

    const options = paginationHelper(req.query);

    const { page, limit, skip, sortBy, sortOrder } = options;

    const result = await postService.getAllPost({
      search: searchString,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });
    // console.log(result);
    // res.status(200).json(result);
    res.status(200).json({
      message: "Data retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      message: "Post retrieved failed",
      error: error.message,
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      throw new Error("Post id is required");
    }
    const result = await postService.getPostById(postId);

    res.status(200).json({
      message: "Data retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      message: "Post retrieved failed",
      error: error.message,
    });
  }
};

const getMyPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      throw new Error("Your are not authorized");
    }

    const result = await postService.getMyPost(user.id);

    res.status(200).json({
      message: "All posts retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      message: "Post retrieved failed",
      error: error.message,
    });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const isAdmin = user?.role === "ADMIN";
    if (!user) {
      throw new Error("Your are not authorized");
    }

    const { postId } = req.params;

    const result = await postService.updatePost(
      postId as string,
      req.body,
      user.id,
      isAdmin
    );

    res.status(201).json({
      message: "Post updated",
      data: result,
    });
  } catch (error: any) {
    // const errorMessage = (error instanceof Error) ? error.message : "Post update failed"
    res.status(400).json({
      message: "Post update failed",
      error: error.message,
    });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const isAdmin = user?.role === "ADMIN";
    const { postId } = req.params;
    const result = await postService.deletePost(
      user?.id as string,
      postId as string,
      isAdmin
    );
    res.status(201).json({
      message: "Post deleted",
      data: result,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Post delete failed";
    res.status(400).json({
      message: errorMessage,
    });
  }
};

const getStats = async (req: Request, res: Response) => {
  try {
    const result = await postService.getStats();
    res.status(200).json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Stats fetched failed";
    res.status(400).json({
      message: errorMessage,
    });
  }
};

export const postController = {
  createPost,
  getAllPost,
  getPostById,
  getMyPost,
  updatePost,
  deletePost,
  getStats,
};
