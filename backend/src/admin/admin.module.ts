import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminController, ModerationReportsController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [AdminController, ModerationReportsController], providers: [AdminService] })
export class AdminModule {}
