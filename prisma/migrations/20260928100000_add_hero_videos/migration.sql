-- CreateTable
CREATE TABLE "HeroVideo" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "poster" TEXT NOT NULL DEFAULT '',
    "caption" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "projectId" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroVideo_status_sortOrder_idx" ON "HeroVideo"("status", "sortOrder");

-- AddForeignKey
ALTER TABLE "HeroVideo" ADD CONSTRAINT "HeroVideo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

