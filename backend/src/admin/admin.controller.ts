import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountStatus, ListingStatus, ModerationStatus, RoleCode } from '@prisma/client';
import { AuthenticatedRequestUser } from '../common/auth/auth.types';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { AdminService } from './admin.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { ModerateProductDto } from './dto/moderate-product.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.ADMINISTRATEUR)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}
  @Get('users') users(@Query() query: ListUsersDto) { return this.admin.users(query); }
  @Get('users/:id') user(@Param('id', ParseUUIDPipe) id: string) { return this.admin.user(id); }
  @Patch('users/:id/status') status(@CurrentUser() actor: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserStatusDto) { return this.admin.updateUserStatus(actor.userId, id, dto); }
  @Patch('users/:id/approve') approve(@CurrentUser() actor: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Body() body: { note?: string }) { return this.admin.approveUser(actor.userId, id, body.note); }
  @Patch('users/:id/suspend') suspend(@CurrentUser() actor: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Body() body: { note?: string }) { return this.admin.suspendUser(actor.userId, id, body.note); }
  @Patch('users/:id/reactivate') reactivate(@CurrentUser() actor: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Body() body: { note?: string }) { return this.admin.reactivateUser(actor.userId, id, body.note); }
  @Get('products') products(@Query('status') status?: ListingStatus) { return this.admin.products(status); }
  @Patch('products/:id/status') moderateProduct(@CurrentUser() actor: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ModerateProductDto) { return this.admin.moderateProduct(actor.userId, id, dto); }
  @Get('reports') reports(@Query('status') status?: ModerationStatus) { return this.admin.reports(status); }
  @Patch('reports/:id/resolve') resolveReport(@CurrentUser() actor: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ResolveReportDto) { return this.admin.resolveReport(actor.userId, id, dto); }
  @Get('statistics') statistics() { return this.admin.stats(); }
  @Get('audit-logs') auditLogs(@Query('limit') limit?: string) { return this.admin.auditLogs(Number(limit) || 100); }
}

@ApiTags('moderation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('moderation/reports')
export class ModerationReportsController {
  constructor(private readonly admin: AdminService) {}
  @Post() create(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreateReportDto) { return this.admin.createReport(user.userId, dto); }
}
