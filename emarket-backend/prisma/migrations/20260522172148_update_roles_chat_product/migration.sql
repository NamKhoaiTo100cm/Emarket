-- AlterEnum
ALTER TYPE "ChatType" ADD VALUE 'staff';

-- AlterTable
ALTER TABLE "ChatConversation" ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "assignedStaffId" INTEGER,
ADD COLUMN     "lastStaffActivity" TIMESTAMP(3);
