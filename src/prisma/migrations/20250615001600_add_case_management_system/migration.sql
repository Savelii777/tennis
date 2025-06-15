/*
  Warnings:

  - You are about to drop the column `price` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `rewards` on the `Case` table. All the data in the column will be lost.
  - You are about to drop the column `reward` on the `CaseOpening` table. All the data in the column will be lost.
  - Added the required column `priceBalls` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ballsSpent` to the `CaseOpening` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CaseItemType" AS ENUM ('VIRTUAL', 'PHYSICAL', 'ACTION');

-- AlterTable
ALTER TABLE "Case" DROP COLUMN "price",
DROP COLUMN "rewards",
ADD COLUMN     "priceBalls" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CaseOpening" DROP COLUMN "reward",
ADD COLUMN     "ballsSpent" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "CaseItem" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CaseItemType" NOT NULL,
    "payload" JSONB NOT NULL,
    "dropChance" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseWinning" (
    "id" SERIAL NOT NULL,
    "openingId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "caseId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseWinning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaseItem_caseId_idx" ON "CaseItem"("caseId");

-- CreateIndex
CREATE INDEX "CaseItem_isActive_idx" ON "CaseItem"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CaseWinning_openingId_key" ON "CaseWinning"("openingId");

-- CreateIndex
CREATE INDEX "CaseWinning_userId_idx" ON "CaseWinning"("userId");

-- CreateIndex
CREATE INDEX "CaseWinning_caseId_idx" ON "CaseWinning"("caseId");

-- CreateIndex
CREATE INDEX "CaseWinning_itemId_idx" ON "CaseWinning"("itemId");

-- CreateIndex
CREATE INDEX "CaseWinning_isProcessed_idx" ON "CaseWinning"("isProcessed");

-- AddForeignKey
ALTER TABLE "CaseItem" ADD CONSTRAINT "CaseItem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseWinning" ADD CONSTRAINT "CaseWinning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseWinning" ADD CONSTRAINT "CaseWinning_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseWinning" ADD CONSTRAINT "CaseWinning_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CaseItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseWinning" ADD CONSTRAINT "CaseWinning_openingId_fkey" FOREIGN KEY ("openingId") REFERENCES "CaseOpening"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
