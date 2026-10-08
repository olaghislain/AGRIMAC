import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RoleCode } from '@prisma/client';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { AuthenticatedRequestUser } from '../common/auth/auth.types';
import { CreateSourceDto } from './dto/create-source.dto';
import { ListScrapeRunsDto } from './dto/list-scrape-runs.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { ValidateSourceDto } from './dto/validate-source.dto';
import { AuthorizationSourceDto } from './dto/authorization-source.dto';
import { ScrapingService } from './scraping.service';

@ApiTags('admin-scraping')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.ADMINISTRATEUR)
@Controller('admin/scraping')
export class ScrapingController {
  constructor(private readonly scraping: ScrapingService) {}

  @Get('sources') @ApiOperation({ summary: 'List configured scraping sources' }) sources() { return this.scraping.listSources(); }
  @Get('sources/:id') @ApiOperation({ summary: 'Get one source with latest execution details' }) source(@Param('id', ParseUUIDPipe) id: string) { return this.scraping.getSource(id); }
  @Post('sources') @ApiOperation({ summary: 'Create an authorized or local fixture source' }) createSource(@Body() dto: CreateSourceDto) { return this.scraping.createSource(dto); }
  @Patch('sources/:id') @ApiOperation({ summary: 'Update a scraping source configuration' }) updateSource(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSourceDto) { return this.scraping.updateSource(id, dto as Record<string, unknown>); }
  @Delete('sources/:id') @ApiOperation({ summary: 'Delete a scraping source and its imported records' }) deleteSource(@Param('id', ParseUUIDPipe) id: string) { return this.scraping.deleteSource(id); }
  @Patch('sources/:id/validation') @ApiOperation({ summary: 'Approve or reject a source after policy review' }) validateSource(@CurrentUser() admin: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ValidateSourceDto) { return this.scraping.validateSource(id, dto.approved, dto.notes, admin.userId); }
  @Patch('sources/:id/authorization') @ApiOperation({ summary: 'Record authorization evidence, rights and operating limits' }) authorization(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AuthorizationSourceDto) { return this.scraping.updateAuthorization(id, dto as unknown as Record<string, unknown>); }
  @Patch('sources/:id/activate') @ApiOperation({ summary: 'Activate an already approved source' }) activateSource(@Param('id', ParseUUIDPipe) id: string) { return this.scraping.activateSource(id); }
  @Patch('sources/:id/deactivate') @ApiOperation({ summary: 'Deactivate a source without deleting it' }) deactivateSource(@Param('id', ParseUUIDPipe) id: string) { return this.scraping.deactivateSource(id); }
  @Post('sources/:id/test') @ApiOperation({ summary: 'Run a controlled source test without persisting machines' }) testSource(@Param('id', ParseUUIDPipe) id: string) { return this.scraping.testSource(id); }
  @Get('sources/:id/stats') @ApiOperation({ summary: 'Get source import statistics and categories' }) sourceStats(@Param('id', ParseUUIDPipe) id: string) { return this.scraping.sourceStats(id); }
  @Post('sources/:id/run') @ApiOperation({ summary: 'Run one source manually' }) runSource(@CurrentUser() _admin: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.scraping.runSource(id); }
  @Get('runs') @ApiOperation({ summary: 'List scraping execution history' }) runs(@Query() query: ListScrapeRunsDto) { return this.scraping.listRuns(query.limit, query.skip); }
  @Get('runs/:id') @ApiOperation({ summary: 'Get one scraping execution with errors' }) run(@Param('id', ParseUUIDPipe) id: string) { return this.scraping.getRun(id); }
  @Get('errors') @ApiOperation({ summary: 'List scraping errors' }) errors(@Query('limit', new ParseIntPipe({ optional: true })) limit = 50, @Query('skip', new ParseIntPipe({ optional: true })) skip = 0) { return this.scraping.listErrors(Math.min(limit, 100), Math.max(skip, 0)); }
  @Get('machines') @ApiOperation({ summary: 'List normalized imported machines' }) machines(@Query('limit', new ParseIntPipe({ optional: true })) limit = 50, @Query('skip', new ParseIntPipe({ optional: true })) skip = 0) { return this.scraping.listMachines(Math.min(limit, 100), Math.max(skip, 0)); }
}
