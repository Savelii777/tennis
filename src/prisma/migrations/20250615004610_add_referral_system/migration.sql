/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredBy" INTEGER;

-- CreateTable
CREATE TABLE "ReferralStats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalInvited" INTEGER NOT NULL DEFAULT 0,
    "activeInvited" INTEGER NOT NULL DEFAULT 0,
    "registeredToday" INTEGER NOT NULL DEFAULT 0,
    "registeredThisWeek" INTEGER NOT NULL DEFAULT 0,
    "registeredThisMonth" INTEGER NOT NULL DEFAULT 0,
    "achievementsEarned" TEXT[],
    "bonusPointsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralActivity" (
    "id" SERIAL NOT NULL,
    "referrerId" INTEGER NOT NULL,
    "invitedUserId" INTEGER NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL,
    "firstMatchAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "inviteSource" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferralStats_userId_key" ON "ReferralStats"("userId");

-- CreateIndex
CREATE INDEX "ReferralStats_userId_idx" ON "ReferralStats"("userId");

-- CreateIndex
CREATE INDEX "ReferralActivity_referrerId_idx" ON "ReferralActivity"("referrerId");

-- CreateIndex
CREATE INDEX "ReferralActivity_invitedUserId_idx" ON "ReferralActivity"("invitedUserId");

-- CreateIndex
CREATE INDEX "ReferralActivity_registeredAt_idx" ON "ReferralActivity"("registeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralStats" ADD CONSTRAINT "ReferralStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralActivity" ADD CONSTRAINT "ReferralActivity_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralActivity" ADD CONSTRAINT "ReferralActivity_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
