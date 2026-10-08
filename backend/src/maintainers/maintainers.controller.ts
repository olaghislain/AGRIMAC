import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleCode } from '@prisma/client';
import { AuthenticatedRequestUser } from '../common/auth/auth.types';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { AvailabilityDto } from './dto/availability.dto';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { CreateMaintainerQuoteDto } from './dto/create-maintainer-quote.dto';
import { UpdateInterventionStatusDto } from './dto/update-intervention-status.dto';
import { UpdateMaintainerProfileDto } from './dto/update-maintainer-profile.dto';
import { ZoneDto } from './dto/zone.dto';
import { MaintainersService } from './maintainers.service';

@ApiTags('maintainers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.MAINTENANCIER)
@Controller('maintainers/me')
export class MaintainersController {
  constructor(private readonly maintainers: MaintainersService) {}
  @Get('profile') profile(@CurrentUser() user: AuthenticatedRequestUser) { return this.maintainers.getProfile(user.userId); }
  @Patch('profile') updateProfile(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: UpdateMaintainerProfileDto) { return this.maintainers.updateProfile(user.userId, dto); }
  @Get('zones') zones(@CurrentUser() user: AuthenticatedRequestUser) { return this.maintainers.listZones(user.userId); }
  @Post('zones') createZone(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: ZoneDto) { return this.maintainers.createZone(user.userId, dto); }
  @Patch('zones/:id') updateZone(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ZoneDto) { return this.maintainers.updateZone(user.userId, id, dto); }
  @Delete('zones/:id') deleteZone(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.maintainers.deleteZone(user.userId, id); }
  @Get('availability') availability(@CurrentUser() user: AuthenticatedRequestUser) { return this.maintainers.availability(user.userId); }
  @Put('availability') setAvailability(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: AvailabilityDto) { return this.maintainers.setAvailability(user.userId, dto); }
  @Get('requests') requests(@CurrentUser() user: AuthenticatedRequestUser) { return this.maintainers.requests(user.userId); }
  @Patch('requests/:id/accept') acceptRequest(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.maintainers.acceptRequest(user.userId, id); }
  @Get('quotes') quotes(@CurrentUser() user: AuthenticatedRequestUser) { return this.maintainers.quotes(user.userId); }
  @Post('quotes') createQuote(@CurrentUser() user: AuthenticatedRequestUser, @Body() body: CreateMaintainerQuoteDto) { return this.maintainers.createQuote(user.userId, body.requestId, body.amountXof, body.message); }
  @Get('interventions') interventions(@CurrentUser() user: AuthenticatedRequestUser) { return this.maintainers.interventions(user.userId); }
  @Post('interventions') createIntervention(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreateInterventionDto) { return this.maintainers.createIntervention(user.userId, dto); }
  @Patch('interventions/:id/status') updateIntervention(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateInterventionStatusDto) { return this.maintainers.updateIntervention(user.userId, id, dto); }
  @Get('history') history(@CurrentUser() user: AuthenticatedRequestUser) { return this.maintainers.history(user.userId); }
  @Get('statistics') stats(@CurrentUser() user: AuthenticatedRequestUser) { return this.maintainers.stats(user.userId); }
}
