import { includes } from "better-auth/*";
import { prisma } from "../../lib/prisma";
import { error } from "node:console";
import { CommentStatus } from "../../../generated/prisma/enums";

const postComment = async (payload: {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
}) => {
  await prisma.posts.findUniqueOrThrow({
    where: {
      id: payload.postId,
    },
  });

  if (payload.parentId) {
    await prisma.comments.findUniqueOrThrow({
      where: {
        id: payload.parentId,
      },
    });
  }

  return await prisma.comments.create({
    data: payload,
  });
};

const getCommentById = async (commentId: string) => {
  return await prisma.comments.findUnique({
    where: {
      id: commentId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
    },
  });
};

const getCommentsByAuthor = async (authorId: string) => {
  return await prisma.comments.findMany({
    where: {
      authorId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

const deleteComment = async (authorId: string, commentId: string) => {
  const commentData = await prisma.comments.findFirst({
    where: {
      id: commentId,
      authorId,
    },
  });

  if (!commentData) {
    throw new Error("You have provide wrong id");
  }

  const result = await prisma.comments.delete({
    where: {
      id: commentData.id,
    },
  });

  return result;
};

//authorId, CommentId, updateData
const updateComment = async (
  authorId: string,
  commentId: string,
  data: { content?: string; status?: CommentStatus }
) => {
  const commentData = await prisma.comments.findFirst({
    where: {
      id: commentId,
      authorId,
    },
  });

  if (!commentData) {
    throw new Error("You have provide wrong id");
  }

  return await prisma.comments.update({
    where: {
      id: commentId,
      authorId,
    },
    data,
  });
};

const moderateComment = async (
  commentId: string,
  data: { status: CommentStatus }
) => {
  const findComment = await prisma.comments.findUniqueOrThrow({
    where: {
      id: commentId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (findComment.status === data.status) {
    throw new Error(`Your comment status(${data.status}) is already upto data`);
  }

  return await prisma.comments.update({
    where: {
      id: commentId,
    },
    data,
  });
};

export const commentService = {
  postComment,
  getCommentById,
  getCommentsByAuthor,
  deleteComment,
  updateComment,
  moderateComment,
};
