-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sportType" TEXT;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "sportType" TEXT DEFAULT 'TENNIS';
