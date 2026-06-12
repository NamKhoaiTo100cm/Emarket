/*
  Warnings:

  - A unique constraint covering the columns `[userId,shopId,type]` on the table `ChatConversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ProductStatus" ADD VALUE 'banned';

-- DropIndex
DROP INDEX "ChatConversation_userId_shopId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ChatConversation_userId_shopId_type_key" ON "ChatConversation"("userId", "shopId", "type");
