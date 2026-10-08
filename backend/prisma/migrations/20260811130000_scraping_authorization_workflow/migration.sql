CREATE TYPE "ScrapedAuthorizationStatus" AS ENUM ('PENDING_REVIEW', 'AUTHORIZATION_REQUIRED', 'AUTHORIZED', 'REJECTED', 'DISABLED');
CREATE TYPE "ScrapedImageReuseStatus" AS ENUM ('UNCLARIFIED', 'AUTHORIZED', 'NOT_AUTHORIZED');

ALTER TABLE "scraped_sources"
  ADD COLUMN "apiUrl" VARCHAR(500),
  ADD COLUMN "authorizationStatus" "ScrapedAuthorizationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
  ADD COLUMN "authorizationGrantedAt" TIMESTAMP(3),
  ADD COLUMN "authorizationProofRef" VARCHAR(500),
  ADD COLUMN "dataExtractionAuthorized" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "listingReuseAuthorized" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "imageReuseStatus" "ScrapedImageReuseStatus" NOT NULL DEFAULT 'UNCLARIFIED',
  ADD COLUMN "reuseImages" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "maxFrequencySeconds" INTEGER,
  ADD COLUMN "maxRequests" INTEGER,
  ADD COLUMN "attributionRules" TEXT,
  ADD COLUMN "deletionPolicy" TEXT,
  ADD COLUMN "updatePolicy" TEXT,
  ADD COLUMN "legalNotes" TEXT,
  ADD COLUMN "lastPolicyCheckedAt" TIMESTAMP(3);

CREATE INDEX "scraped_sources_authorizationStatus_enabled_idx" ON "scraped_sources"("authorizationStatus", "enabled");

INSERT INTO "scraped_sources" (
  "id", "name", "baseUrl", "robotsUrl", "termsUrl", "status", "validationStatus", "authorizationStatus", "enabled", "isFixture", "requestDelayMs", "timeoutMs", "maxPages", "maxItems", "createdAt", "updatedAt"
) VALUES (
  '2d5c8e4b-5d74-4d84-9c98-6e1db5a90301',
  'CoinAfrique Bénin',
  'https://bj.coinafrique.com/categorie/materiel-agricole',
  'https://bj.coinafrique.com/robots.txt',
  'https://bj.coinafrique.com/tu',
  'INACTIVE',
  'PENDING',
  'AUTHORIZATION_REQUIRED',
  false,
  false,
  1500,
  10000,
  10,
  500,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
