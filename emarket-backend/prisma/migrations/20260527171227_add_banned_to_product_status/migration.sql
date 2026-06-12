/*
  Warnings:

  - A unique constraint covering the columns `[userId,shopId]` on the table `ChatConversation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ChatConversation_userId_shopId_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "ChatConversation_userId_shopId_key" ON "ChatConversation"("userId", "shopId");
