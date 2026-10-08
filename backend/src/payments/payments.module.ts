import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentWebhookController, PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentProviderService } from './payment-provider.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({ imports: [PrismaModule, AuthModule, NotificationsModule], controllers: [PaymentsController, PaymentWebhookController], providers: [PaymentsService, PaymentProviderService], exports: [PaymentsService] })
export class PaymentsModule {}
