import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CatalogModule } from './catalog/catalog.module';
import { RequestsModule } from './requests/requests.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentsModule } from './payments/payments.module';
import { CompaniesModule } from './companies/companies.module';
import { OrdersModule } from './orders/orders.module';
import { QuotesModule } from './quotes/quotes.module';
import { MaintainersModule } from './maintainers/maintainers.module';
import { AdminModule } from './admin/admin.module';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';
import { MetricsModule } from './common/metrics/metrics.module';
import { ScrapingModule } from './scraping/scraping.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', 'backend/.env'] }), MetricsModule, PrismaModule, HealthModule, AuthModule, UsersModule, CatalogModule, RequestsModule, FavoritesModule, ReviewsModule, PaymentsModule, CompaniesModule, OrdersModule, QuotesModule, MaintainersModule, AdminModule, NotificationsModule, MessagingModule, UploadsModule, ScrapingModule],
})
export class AppModule {}
