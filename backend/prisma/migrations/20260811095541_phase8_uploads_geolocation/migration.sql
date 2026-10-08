-- CreateEnum
CREATE TYPE "UploadPurpose" AS ENUM ('REQUEST_PHOTO', 'PRODUCT_PHOTO', 'DOCUMENT', 'MESSAGE_ATTACHMENT', 'INVOICE', 'PROFILE_DOCUMENT');

-- CreateTable
CREATE TABLE "uploads" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "purpose" "UploadPurpose" NOT NULL,
    "resourceType" VARCHAR(60),
    "resourceId" VARCHAR(80),
    "storageKey" VARCHAR(500) NOT NULL,
    "originalName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(120) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uploads_storageKey_key" ON "uploads"("storageKey");

-- CreateIndex
CREATE INDEX "uploads_ownerId_createdAt_idx" ON "uploads"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "uploads_resourceType_resourceId_idx" ON "uploads"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "uploads_purpose_createdAt_idx" ON "uploads"("purpose", "createdAt");

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
