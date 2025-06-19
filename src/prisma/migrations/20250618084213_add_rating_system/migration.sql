-- CreateTable
CREATE TABLE "PlayerRating" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "skillRating" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "skillPoints" INTEGER NOT NULL DEFAULT 1400,
    "pointsRating" INTEGER NOT NULL DEFAULT 1000,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "matchId" INTEGER,
    "seasonId" INTEGER,
    "skillPointsBefore" INTEGER NOT NULL,
    "skillPointsAfter" INTEGER NOT NULL,
    "pointsRatingBefore" INTEGER NOT NULL,
    "pointsRatingAfter" INTEGER NOT NULL,
    "isWin" BOOLEAN NOT NULL,
    "opponentId" INTEGER,
    "opponentSkillPoints" INTEGER,
    "pointsEarned" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RatingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingSeason" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RatingSeason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerRating_userId_key" ON "PlayerRating"("userId");

-- CreateIndex
CREATE INDEX "PlayerRating_skillPoints_idx" ON "PlayerRating"("skillPoints");

-- CreateIndex
CREATE INDEX "PlayerRating_pointsRating_idx" ON "PlayerRating"("pointsRating");

-- CreateIndex
CREATE INDEX "RatingHistory_userId_idx" ON "RatingHistory"("userId");

-- CreateIndex
CREATE INDEX "RatingHistory_matchId_idx" ON "RatingHistory"("matchId");

-- CreateIndex
CREATE INDEX "RatingHistory_seasonId_idx" ON "RatingHistory"("seasonId");

-- CreateIndex
CREATE INDEX "RatingSeason_isCurrent_idx" ON "RatingSeason"("isCurrent");

-- CreateIndex
CREATE INDEX "RatingSeason_startDate_endDate_idx" ON "RatingSeason"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "PlayerRating" ADD CONSTRAINT "PlayerRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingHistory" ADD CONSTRAINT "RatingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingHistory" ADD CONSTRAINT "RatingHistory_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingHistory" ADD CONSTRAINT "RatingHistory_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "RatingSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingHistory" ADD CONSTRAINT "RatingHistory_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;
