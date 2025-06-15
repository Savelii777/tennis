/*
  Warnings:

  - You are about to drop the column `description` on the `BallTransaction` table. All the data in the column will be lost.
  - Added the required column `balanceAfter` to the `BallTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `BallTransaction` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `BallTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BallTransactionType" AS ENUM ('EARNED', 'SPENT', 'BONUS', 'REFUND');

-- AlterTable
ALTER TABLE "BallTransaction" DROP COLUMN "description",
ADD COLUMN     "balanceAfter" INTEGER NOT NULL,
ADD COLUMN     "reason" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "BallTransactionType" NOT NULL;

-- CreateIndex
CREATE INDEX "BallTransaction_userId_idx" ON "BallTransaction"("userId");

-- CreateIndex
CREATE INDEX "BallTransaction_createdAt_idx" ON "BallTransaction"("createdAt");
