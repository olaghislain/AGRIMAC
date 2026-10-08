-- CreateEnum
CREATE TYPE "ScrapedSourceValidationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');


-- AlterTable
ALTER TABLE "scraped_sources" ADD COLUMN "validationNotes" TEXT, ADD COLUMN "validatedAt" TIMESTAMP(3), ADD COLUMN "validatedById" UUID, ADD COLUMN "validationStatus" "ScrapedSourceValidationStatus" NOT NULL DEFAULT 'PENDING', ADD COLUMN "maxItems" INTEGER NOT NULL DEFAULT 500;

CREATE INDEX "scraped_sources_validationStatus_enabled_idx" ON "scraped_sources"("validationStatus", "enabled");
