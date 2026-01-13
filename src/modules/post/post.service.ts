import { promise } from "better-auth/*";
import {
  CommentStatus,
  Posts,
  PostStatus,
} from "../../../generated/prisma/client";
import { PostsWhereInput } from "../../../generated/prisma/models";
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

const getAllPost = async ({
  search,
  tags,
  isFeatured,
  status,
  authorId,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
}: {
  search: string | undefined;
  tags: string[] | [];
  isFeatured: boolean | undefined;
  status: PostStatus | undefined;
  authorId: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const andConditions: PostsWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search as string,
          },
        },
      ],
    });
  }
  if (tags.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: tags as string[],
      },
    });
  }

  if (typeof isFeatured === "boolean") {
    andConditions.push({
      isFeatured,
    });
  }

  if (status) {
    andConditions.push({
      status: status,
    });
  }

  if (authorId) {
    andConditions.push({
      authorId,
    });
  }

  const result = await prisma.posts.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });
  const count = await prisma.posts.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: result,
    pagination: {
      count,
      page,
      limit,
      totalPage: Math.ceil(count / limit),
    },
  };
};

const getPostById = async (postId: string) => {
  // const updateViewCount = await prisma.posts.update({
  //   where: {
  //     id: postId,
  //   },
  //   data: {
  //     views: {
  //       increment: 1,
  //     },
  //   },
  // });
  // const result = await prisma.posts.findUnique({
  //   where: {
  //     id: postId,
  //   },
  // });

  return await prisma.$transaction(async (tx) => {
    await tx.posts.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const postResult = await tx.posts.findUnique({
      where: {
        id: postId,
      },
      include: {
        comments: {
          where: {
            parentId: null,
            status: "APPROVED",
          },
          orderBy: { createdAt: "desc" },
          include: {
            replies: {
              where: {
                status: "APPROVED",
              },
              orderBy: { createdAt: "desc" },
              include: {
                replies: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });
    return postResult;
  });
};

const getMyPost = async (authorId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: authorId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  const result = await prisma.posts.findMany({
    where: {
      authorId: authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  // const totalPost = await prisma.posts.count({
  //   where: {
  //     authorId: authorId,
  //   },
  // });

  // const totalPost = await prisma.posts.aggregate({
  //   _count: {
  //     id: true,
  //   },
  //   where: {
  //     authorId,
  //   },
  // });

  return result;
};

const updatePost = async (
  postId: string,
  data: Partial<Posts>,
  authorId: string,
  isAdmin: boolean
) => {
  const postData = await prisma.posts.findFirstOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });
  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("You're not the owner of this post");
  }
  if (!isAdmin) {
    delete data.isFeatured;
  }
  const result = await prisma.posts.update({
    where: {
      id: postId,
    },
    data,
  });

  return result;
};

const deletePost = async (
  authorId: string,
  postId: string,
  isAdmin: boolean
) => {
  const postData = await prisma.posts.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });
  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("You're not the owner/creator of this post");
  }
  return await prisma.posts.delete({
    where: {
      id: postId,
    },
  });
};

const getStats = async () => {
  return await prisma.$transaction(async (tx) => {
    // const totalPost = await tx.posts.count();
    // const publishedPost = await tx.posts.count({
    //   where: {
    //     status: PostStatus.PUBLISHED,
    //   },
    // });
    // const draftPost = await tx.posts.count({
    //   where: {
    //     status: PostStatus.DRAFT,
    //   },
    // });
    // const archivePost = await tx.posts.count({
    //   where: {
    //     status: PostStatus.ARCHIVE,
    //   },
    // });

    const [
      totalPost,
      publishedPost,
      draftPost,
      archivePost,
      totalComment,
      approvedComment,
      rejectedComment,
      totalUsers,
      adminCount,
      userCount,
      totalViews,
    ] = await Promise.all([
      await tx.posts.count(),
      await tx.posts.count({ where: { status: PostStatus.PUBLISHED } }),
      await tx.posts.count({ where: { status: PostStatus.DRAFT } }),
      await tx.posts.count({ where: { status: PostStatus.ARCHIVE } }),
      await tx.comments.count(),
      await tx.comments.count({ where: { status: CommentStatus.APPROVED } }),
      await tx.comments.count({ where: { status: CommentStatus.REJECTED } }),
      await tx.user.count(),
      await tx.user.count({ where: { role: "USER" } }),
      await tx.user.count({ where: { role: "ADMIN" } }),
      await tx.posts.aggregate({ _sum: { views: true } }),
    ]);
    return {
      totalPost,
      publishedPost,
      draftPost,
      archivePost,
      totalComment,
      approvedComment,
      rejectedComment,
      totalUsers,
      adminCount,
      userCount,
      totalViews: totalViews._sum.views,
    };
  });
};

export const postService = {
  createPost,
  getAllPost,
  getPostById,
  getMyPost,
  updatePost,
  deletePost,
  getStats,
};
