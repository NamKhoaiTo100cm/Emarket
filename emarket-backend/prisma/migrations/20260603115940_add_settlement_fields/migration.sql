-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isSettled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "settlementAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ShopBalance" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "balance" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "pendingBalance" DECIMAL(15,0) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "amount" DECIMAL(15,0) NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankAccount" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "shopBalanceId" INTEGER,

    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopBalance_shopId_key" ON "ShopBalance"("shopId");

-- AddForeignKey
ALTER TABLE "ShopBalance" ADD CONSTRAINT "ShopBalance_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_shopBalanceId_fkey" FOREIGN KEY ("shopBalanceId") REFERENCES "ShopBalance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
