-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "caption" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewsCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Story_publishedAt_idx" ON "Story"("publishedAt");
