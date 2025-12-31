import { Posts } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Posts, "id" | "createAt" | "updatedAt" | "authorId">,
  userId: string
) => {
  const result = await prisma.posts.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  return result;
};

const getAllPost = async () => {
  const result = await prisma.posts.findMany();
  return result;
};

export const postService = {
  createPost,
  getAllPost,
};
