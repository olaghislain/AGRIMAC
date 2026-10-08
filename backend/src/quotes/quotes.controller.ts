import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleCode } from '@prisma/client';
import { AuthenticatedRequestUser } from '../common/auth/auth.types';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { RespondQuoteDto } from './dto/respond-quote.dto';
import { QuotesService } from './quotes.service';

@ApiTags('company-quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.ENTREPRISE)
@Controller('company-quotes')
export class QuotesController {
  constructor(private readonly quotes: QuotesService) {}
  @Get() list(@CurrentUser() user: AuthenticatedRequestUser) { return this.quotes.list(user.userId); }
  @Post() respond(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: RespondQuoteDto) { return this.quotes.respond(user.userId, dto); }
}
