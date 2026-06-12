/*
  Warnings:

  - You are about to drop the column `voucherCode` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code,shopId]` on the table `Voucher` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VoucherScope" AS ENUM ('platform', 'shop');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_voucherCode_fkey";

-- DropIndex
DROP INDEX "Voucher_code_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "voucherCode",
ADD COLUMN     "voucherId" INTEGER;

-- AlterTable
ALTER TABLE "Voucher" ADD COLUMN     "maxDiscount" DECIMAL(15,0),
ADD COLUMN     "scope" "VoucherScope" NOT NULL DEFAULT 'platform',
ADD COLUMN     "shopId" INTEGER,
ADD COLUMN     "startAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_shopId_key" ON "Voucher"("code", "shopId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
