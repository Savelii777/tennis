/*
  Warnings:

  - The values [ROUND_ROBIN] on the enum `TournamentType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bracket` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `organizerId` on the `Tournament` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentPlayers` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isRanked` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxPlayers` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minPlayers` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TournamentType_new" AS ENUM ('SINGLE_ELIMINATION', 'GROUPS_PLAYOFF', 'LEAGUE', 'BLITZ');
ALTER TABLE "Tournament" ALTER COLUMN "type" TYPE "TournamentType_new" USING ("type"::text::"TournamentType_new");
ALTER TYPE "TournamentType" RENAME TO "TournamentType_old";
ALTER TYPE "TournamentType_new" RENAME TO "TournamentType";
DROP TYPE "TournamentType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Tournament" DROP CONSTRAINT "Tournament_organizerId_fkey";

-- AlterTable
ALTER TABLE "Tournament" DROP COLUMN "bracket",
DROP COLUMN "organizerId",
ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "currentPlayers" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "formatDetails" JSONB,
ADD COLUMN     "isRanked" BOOLEAN NOT NULL,
ADD COLUMN     "locationId" INTEGER,
ADD COLUMN     "locationName" TEXT,
ADD COLUMN     "maxPlayers" INTEGER NOT NULL,
ADD COLUMN     "minPlayers" INTEGER NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TournamentMatch" (
    "id" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "round" INTEGER,
    "group" TEXT,
    "playerAId" INTEGER NOT NULL,
    "playerBId" INTEGER,
    "score" TEXT,
    "winnerId" INTEGER,
    "status" TEXT NOT NULL,
    "court" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "confirmedBy" INTEGER[],
    "isThirdPlaceMatch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TournamentToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TournamentToUser_AB_unique" ON "_TournamentToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TournamentToUser_B_index" ON "_TournamentToUser"("B");

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TournamentToUser" ADD CONSTRAINT "_TournamentToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TournamentToUser" ADD CONSTRAINT "_TournamentToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
