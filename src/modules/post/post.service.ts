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

const getAllPost = async (payload: { search: string | undefined }) => {
  const result = await prisma.posts.findMany({
    where: {
      OR: [
        {
          title: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: payload.search as string,
          },
        },
      ],
    },
  });
  return result;
};

export const postService = {
  createPost,
  getAllPost,
};
