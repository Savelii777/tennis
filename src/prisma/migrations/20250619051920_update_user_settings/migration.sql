/*
  Warnings:

  - You are about to drop the column `emailNotifications` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `pushNotifications` on the `UserSettings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserSettings" DROP CONSTRAINT "UserSettings_userId_fkey";

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "emailNotifications",
DROP COLUMN "pushNotifications",
ADD COLUMN     "allowMatchInvites" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cityId" INTEGER,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT E'ru',
ADD COLUMN     "matchReminderTime" TEXT NOT NULL DEFAULT E'1h',
ADD COLUMN     "notifyEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyMatchResults" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyTelegram" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyTournamentResults" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "preferredAgeMax" INTEGER,
ADD COLUMN     "preferredAgeMin" INTEGER,
ADD COLUMN     "preferredGender" TEXT,
ADD COLUMN     "preferredLevelMax" DOUBLE PRECISION,
ADD COLUMN     "preferredLevelMin" DOUBLE PRECISION,
ADD COLUMN     "requireMatchConfirm" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showProfilePublicly" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showRatingPublicly" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sportId" INTEGER,
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT E'light',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT E'Europe/Moscow';

-- CreateIndex
CREATE INDEX "UserSettings_language_idx" ON "UserSettings"("language");

-- CreateIndex
CREATE INDEX "UserSettings_notificationsEnabled_idx" ON "UserSettings"("notificationsEnabled");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
