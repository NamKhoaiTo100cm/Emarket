-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('none', 'pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "requiresVerification" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'none';

-- CreateTable
CREATE TABLE "ShopVerification" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "note" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "staffNote" TEXT,
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationDoc" (
    "id" SERIAL NOT NULL,
    "shopVerificationId" INTEGER NOT NULL,
    "imagePath" TEXT NOT NULL,

    CONSTRAINT "VerificationDoc_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShopVerification" ADD CONSTRAINT "ShopVerification_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationDoc" ADD CONSTRAINT "VerificationDoc_shopVerificationId_fkey" FOREIGN KEY ("shopVerificationId") REFERENCES "ShopVerification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
