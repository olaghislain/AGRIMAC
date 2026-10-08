# AGRIMAC Scraping Sources

## Current Status

No external source is configured, enabled, or scraped. The only executable source is the local fixture:

```text
fixture://agricultural-machines
```

Fixture records are explicitly marked by their `fixture://` URLs and are not real marketplace data.

The scheduler is disabled by default:

```env
SCRAPING_SCHEDULER_ENABLED=false
```

## Source Lifecycle

Every new source starts as:

```text
enabled = false
status = INACTIVE
validationStatus = PENDING
status = INACTIVE
```

The combined lifecycle is represented by two fields so validation and operational state cannot be confused:

```text
PENDING_REVIEW = validationStatus:PENDING + status:INACTIVE
APPROVED       = validationStatus:APPROVED + status:INACTIVE
ACTIVE         = validationStatus:APPROVED + status:ACTIVE + enabled:true
DISABLED       = validationStatus:(PENDING|APPROVED|REJECTED) + status:DISABLED + enabled:false
REJECTED       = validationStatus:REJECTED + status:INACTIVE + enabled:false
```

Activation requires the following sequence:

1. Create the source with `enabled=false`.
2. Verify the source terms, robots policy, data rights, image rights, rate limits, and any API/feed option.
3. Call the Admin validation endpoint with approval and review notes.
4. Call the activation endpoint.
5. Run a controlled test.
6. Enable the scheduler only after the written authorization is recorded outside the application and the source-specific parser is installed.

Changing `baseUrl`, `robotsUrl`, `termsUrl`, or `isFixture` resets the source to pending and disables it.

## Future Source Checklist

Before adding a real source, provide:

- Official website URL.
- Exact listing/category URLs.
- `robots.txt` URL and relevant rules.
- Terms of use URL.
- Privacy/data policy URL.
- Written authorization or official API/feed agreement.
- Permitted request frequency and concurrency.
- Timeout and page/item limits.
- Categories to import.
- Exact fields available on listing and detail pages.
- External listing identifier rules.
- Pagination rules.
- Availability and location semantics.
- Price and currency formats.
- Image reuse permission and attribution requirements.
- Deletion/update policy for removed listings.

No external source is currently registered. The HTTP scraper contract intentionally refuses to issue a request until a source-specific scraper and parser have been installed and reviewed.

## Source-Specific Implementation

Each approved source must add its own classes:

```text
src/scraping/sources/<source>.scraper.ts
src/scraping/parsers/<source>.parser.ts
src/scraping/tests/<source>.spec.ts
```

The scraper implements `SourceScraper`. The parser implements `MachineParser` and only maps the source's documented HTML/API fields into `NormalizedMachine`.

Do not place source selectors in `ScrapingService`. Register the new scraper in `SourceScraperRegistry` and add its provider to `ScrapingModule`.

## Approved Future Sources

The following sources were researched but are intentionally not configured:

- CoinAfrique Bénin.
- MarketBook South Africa.
- Mascus.

They require authorization review before any request, data import, or image handling is enabled.

## Authorization Workflow

The `ScrapedSource` record stores the authorization dossier without storing scraped data:

- `apiUrl`
- `authorizationStatus`
- `authorizationGrantedAt`
- `authorizationProofRef`
- `dataExtractionAuthorized`
- `listingReuseAuthorized`
- `imageReuseStatus`
- `reuseImages`
- `maxFrequencySeconds`
- `maxRequests`
- `attributionRules`
- `deletionPolicy`
- `updatePolicy`
- `legalNotes`
- `lastPolicyCheckedAt`

CoinAfrique Bénin is registered only as metadata with:

```text
authorizationStatus = AUTHORIZATION_REQUIRED
status = INACTIVE
```

No announcement, image, or external response is stored.

An administrator must use `PATCH /api/v1/admin/scraping/sources/:id/authorization` to record a valid dossier. Setting `AUTHORIZED` is rejected unless the proof reference, authorization date, extraction rights, listing reuse rights, maximum frequency, and maximum request count are present. Image reuse rights are also required when `reuseImages=true`.

Only after that dossier is complete, the existing policy validation is approved, and the source is explicitly activated can the source become executable. The scheduler additionally requires `authorizationStatus=AUTHORIZED`, `status=ACTIVE`, `enabled=true`, `validationStatus=APPROVED`, and `isFixture=false`.

## CoinAfrique Bénin: Prepared but Not Activated

The official pages were analyzed without registering or executing the source in AGRIMAC.

Verified URLs:

- Site/category: `https://bj.coinafrique.com/categorie/materiel-agricole`
- Search: `https://bj.coinafrique.com/search?query=tracteur`
- Robots: `https://bj.coinafrique.com/robots.txt`
- Terms of use: `https://bj.coinafrique.com/tu`
- Terms of sale: `https://bj.coinafrique.com/tc`
- Privacy: `https://bj.coinafrique.com/pp`
- Sitemap: `https://bj.coinafrique.com/sitemaps.xml`

Verified listing structure:

- Listing container: `.adcard__listing[data-view-origin="sub-category-page-listing"]`.
- Card: `.card.ad__card.round.small.hoverable`.
- Title/link: `.ad__card-description > a`.
- Price: `.ad__card-price > a`.
- Location: `.ad__card-location > span`.
- Age: `.ad__card-timesince .time`.
- External ID: `.card-fav[data-post-id]`.
- Category: `.card-fav[data-ad-category]` or `#gtm-category[value]`.
- Image reference: `.ad__card-image > img.ad__card-img`.
- Detail URL pattern: `/annonce/materiel-agricole/{slug}-{numericId}`.
- Pagination observed: `?page=2`, with `.pagination.custom` and `.pagination-number`.

The listing page did not verify dedicated brand, model, seller, description, technical-specification, availability, or publication-date fields. The parser therefore leaves those values undefined instead of deriving them from titles.

CoinAfrique’s robots policy disallows search/query paths including `/search?*`, `/profil/*`, `/tc/*`, and other paths. Its published terms define the announcement service and paid options, but reuse rights for announcements and images are not granted by public accessibility. Written authorization or an official API/feed agreement is required before any request, extraction, image reuse, or activation.

The dedicated implementation is intentionally blocked and not persisted as a source:

```text
src/scraping/parsers/coinafrique.parser.ts
src/scraping/sources/coinafrique.scraper.ts
```
