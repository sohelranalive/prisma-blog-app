/*
  Warnings:

  - You are about to drop the column `parenId` on the `comments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_parenId_fkey";

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "parenId",
ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
