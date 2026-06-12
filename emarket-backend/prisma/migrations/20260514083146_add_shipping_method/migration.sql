-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('standard', 'express', 'same_day');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingMethod" "ShippingMethod" NOT NULL DEFAULT 'standard';
