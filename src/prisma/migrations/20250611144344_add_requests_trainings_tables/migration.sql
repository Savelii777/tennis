-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('SINGLE_GAME', 'TOURNAMENT', 'TRAINING');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED', 'DONE');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('FREE', 'HOST_PAYS', 'LOSER_PAYS', 'DIVIDED', 'FIXED_PRICE');

-- CreateEnum
CREATE TYPE "RatingType" AS ENUM ('RATED', 'UNRATED');

-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('WITH_COACH', 'WITHOUT_COACH', 'TIEBREAK', 'SPARRING', 'TECHNIQUE');

-- CreateEnum
CREATE TYPE "CourtSurface" AS ENUM ('HARD', 'CLAY', 'GRASS', 'CARPET');

-- CreateTable
CREATE TABLE "GameRequest" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "creatorId" INTEGER NOT NULL,
    "locationName" TEXT,
    "maxPlayers" INTEGER NOT NULL,
    "currentPlayers" INTEGER NOT NULL DEFAULT 1,
    "gameMode" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "paymentType" TEXT NOT NULL,
    "ratingType" TEXT NOT NULL,
    "formatInfo" JSONB,
    "status" TEXT NOT NULL DEFAULT E'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestResponse" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT E'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "creatorId" INTEGER NOT NULL,
    "locationName" TEXT,
    "courtSurface" "CourtSurface" DEFAULT E'HARD',
    "minLevel" DOUBLE PRECISION,
    "maxLevel" DOUBLE PRECISION,
    "maxSlots" INTEGER NOT NULL,
    "currentSlots" INTEGER NOT NULL DEFAULT 1,
    "paymentType" "PaymentType" NOT NULL DEFAULT E'DIVIDED',
    "pricePerPerson" DOUBLE PRECISION,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "TrainingState" NOT NULL DEFAULT E'OPEN',
    "trainingType" "TrainingType" NOT NULL DEFAULT E'WITHOUT_COACH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RequestParticipants" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_TrainingParticipants" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestResponse_requestId_userId_key" ON "RequestResponse"("requestId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestParticipants_AB_unique" ON "_RequestParticipants"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestParticipants_B_index" ON "_RequestParticipants"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TrainingParticipants_AB_unique" ON "_TrainingParticipants"("A", "B");

-- CreateIndex
CREATE INDEX "_TrainingParticipants_B_index" ON "_TrainingParticipants"("B");

-- AddForeignKey
ALTER TABLE "GameRequest" ADD CONSTRAINT "GameRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestResponse" ADD CONSTRAINT "RequestResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestResponse" ADD CONSTRAINT "RequestResponse_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "GameRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestParticipants" ADD CONSTRAINT "_RequestParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "GameRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestParticipants" ADD CONSTRAINT "_RequestParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrainingParticipants" ADD CONSTRAINT "_TrainingParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrainingParticipants" ADD CONSTRAINT "_TrainingParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
