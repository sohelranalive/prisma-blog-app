import { Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationHelper from "../../helpers/paginationHelper";

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

export const postController = {
  createPost,
  getAllPost,
};
