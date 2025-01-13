-- CreateTable
CREATE TABLE "Domain" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- DropIndex
DROP INDEX IF EXISTS "Domain_url_key";

-- CreateIndex
CREATE UNIQUE INDEX "Domain_url_isActive_key" ON "Domain"("url", "isActive") WHERE isActive = true;
