import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FixtureMachinesParser } from './parsers/fixture-machines.parser';
import { MachineNormalizerService } from './normalization/machine-normalizer.service';
import { ScrapingController } from './scraping.controller';
import { ScrapingHttpService } from './scraping-http.service';
import { ScrapingPolicyService } from './scraping-policy.service';
import { ScrapingRepository } from './scraping.repository';
import { ScrapingScheduler } from './scraping.scheduler';
import { ScrapingService } from './scraping.service';
import { FixtureMachinesScraper } from './sources/fixture-machines.scraper';
import { HttpMachinesScraper } from './sources/http-machines.scraper';
import { SourceScraperRegistry } from './sources/source-scraper.registry';
import { CoinAfriqueBeninScraper } from './sources/coinafrique.scraper';
import { CoinAfriqueBeninParser } from './parsers/coinafrique.parser';

@Module({ imports: [PrismaModule, AuthModule, ScheduleModule.forRoot()], controllers: [ScrapingController], providers: [FixtureMachinesParser, CoinAfriqueBeninParser, MachineNormalizerService, ScrapingHttpService, ScrapingPolicyService, ScrapingRepository, ScrapingService, ScrapingScheduler, FixtureMachinesScraper, HttpMachinesScraper, CoinAfriqueBeninScraper, SourceScraperRegistry], exports: [ScrapingService] })
export class ScrapingModule {}
