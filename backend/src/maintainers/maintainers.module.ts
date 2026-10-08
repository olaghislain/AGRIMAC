import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MaintainersController } from './maintainers.controller';
import { MaintainersService } from './maintainers.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [MaintainersController], providers: [MaintainersService] })
export class MaintainersModule {}
