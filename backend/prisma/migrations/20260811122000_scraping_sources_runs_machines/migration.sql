-- CreateEnum
CREATE TYPE "ScrapedSourceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ScrapeRunStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED');

-- CreateTable
CREATE TABLE "scraped_sources" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "baseUrl" VARCHAR(500) NOT NULL,
    "robotsUrl" VARCHAR(500),
    "termsUrl" VARCHAR(500),
    "status" "ScrapedSourceStatus" NOT NULL DEFAULT 'INACTIVE',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "isFixture" BOOLEAN NOT NULL DEFAULT false,
    "requestDelayMs" INTEGER NOT NULL DEFAULT 1500,
    "timeoutMs" INTEGER NOT NULL DEFAULT 10000,
    "maxPages" INTEGER NOT NULL DEFAULT 10,
    "lastScrapedAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "scraped_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scraped_machines" (
    "id" UUID NOT NULL,
    "sourceId" UUID NOT NULL,
    "externalId" VARCHAR(240),
    "canonicalKey" VARCHAR(320) NOT NULL,
    "sourceUrl" VARCHAR(800) NOT NULL,
    "name" VARCHAR(240) NOT NULL,
    "brand" VARCHAR(120),
    "model" VARCHAR(160),
    "category" VARCHAR(160),
    "machineType" VARCHAR(160),
    "description" TEXT,
    "technicalSpecs" JSONB,
    "price" INTEGER,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'XOF',
    "availability" VARCHAR(120),
    "location" VARCHAR(180),
    "imageUrl" VARCHAR(800),
    "scrapedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "scraped_machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrape_runs" (
    "id" UUID NOT NULL,
    "sourceId" UUID NOT NULL,
    "status" "ScrapeRunStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "pagesVisited" INTEGER NOT NULL DEFAULT 0,
    "itemsFound" INTEGER NOT NULL DEFAULT 0,
    "itemsCreated" INTEGER NOT NULL DEFAULT 0,
    "itemsUpdated" INTEGER NOT NULL DEFAULT 0,
    "duplicates" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scrape_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrape_errors" (
    "id" UUID NOT NULL,
    "runId" UUID NOT NULL,
    "url" VARCHAR(800),
    "statusCode" INTEGER,
    "errorType" VARCHAR(120) NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scrape_errors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scraped_sources_baseUrl_key" ON "scraped_sources"("baseUrl");
CREATE INDEX "scraped_sources_status_enabled_idx" ON "scraped_sources"("status", "enabled");
CREATE INDEX "scraped_sources_nextRunAt_enabled_idx" ON "scraped_sources"("nextRunAt", "enabled");
CREATE UNIQUE INDEX "scraped_machines_sourceId_canonicalKey_key" ON "scraped_machines"("sourceId", "canonicalKey");
CREATE UNIQUE INDEX "scraped_machines_sourceId_externalId_key" ON "scraped_machines"("sourceId", "externalId");
CREATE INDEX "scraped_machines_sourceId_sourceUrl_idx" ON "scraped_machines"("sourceId", "sourceUrl");
CREATE INDEX "scraped_machines_brand_model_idx" ON "scraped_machines"("brand", "model");
CREATE INDEX "scraped_machines_category_idx" ON "scraped_machines"("category");
CREATE INDEX "scraped_machines_scrapedAt_idx" ON "scraped_machines"("scrapedAt");
CREATE INDEX "scrape_runs_sourceId_createdAt_idx" ON "scrape_runs"("sourceId", "createdAt");
CREATE INDEX "scrape_runs_status_createdAt_idx" ON "scrape_runs"("status", "createdAt");
CREATE INDEX "scrape_errors_runId_createdAt_idx" ON "scrape_errors"("runId", "createdAt");
CREATE INDEX "scrape_errors_errorType_createdAt_idx" ON "scrape_errors"("errorType", "createdAt");

-- AddForeignKey
ALTER TABLE "scraped_machines" ADD CONSTRAINT "scraped_machines_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "scraped_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scrape_runs" ADD CONSTRAINT "scrape_runs_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "scraped_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scrape_errors" ADD CONSTRAINT "scrape_errors_runId_fkey" FOREIGN KEY ("runId") REFERENCES "scrape_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
