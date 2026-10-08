import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleCode } from '@prisma/client';
import { AuthenticatedRequestUser } from '../common/auth/auth.types';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { CompaniesService } from './companies.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { StatisticsQueryDto } from './dto/statistics-query.dto';
import PDFDocument from 'pdfkit';
import type { Response } from 'express';

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.ENTREPRISE)
@Controller('companies/me')
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}
  @Get() company(@CurrentUser() user: AuthenticatedRequestUser) { return this.companies.getCompany(user.userId); }
  @Patch() updateCompany(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: UpdateCompanyProfileDto) { return this.companies.updateCompany(user.userId, dto); }
  @Get('products') products(@CurrentUser() user: AuthenticatedRequestUser) { return this.companies.listProducts(user.userId); }
  @Post('products') createProduct(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreateProductDto) { return this.companies.createProduct(user.userId, dto); }
  @Patch('products/:id') updateProduct(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) { return this.companies.updateProduct(user.userId, id, dto); }
  @Delete('products/:id') deleteProduct(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.companies.deleteProduct(user.userId, id); }
  @Get('services') services(@CurrentUser() user: AuthenticatedRequestUser) { return this.companies.listServices(user.userId); }
  @Post('services') createService(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreateServiceDto) { return this.companies.createService(user.userId, dto); }
  @Patch('services/:id') updateService(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateServiceDto) { return this.companies.updateService(user.userId, id, dto); }
  @Delete('services/:id') deleteService(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.companies.deleteService(user.userId, id); }
  @Get('statistics') statistics(@CurrentUser() user: AuthenticatedRequestUser) { return this.companies.stats(user.userId); }
  @Get('statistics/timeseries') timeseries(@CurrentUser() user: AuthenticatedRequestUser, @Query() query: StatisticsQueryDto) { return this.companies.timeseries(user.userId, query); }
  @Get('reports/summary') reportSummary(@CurrentUser() user: AuthenticatedRequestUser) { return this.companies.reportSummary(user.userId); }
  @Get('reports/summary/pdf') async reportSummaryPdf(@CurrentUser() user: AuthenticatedRequestUser, @Res() response: Response) { const report = await this.companies.reportSummary(user.userId); const document = new PDFDocument({ size: 'A4', margin: 52 }); response.setHeader('Content-Type', 'application/pdf'); response.setHeader('Content-Disposition', `attachment; filename="rapport-${report.company.id}.pdf"`); document.pipe(response); document.fillColor('#106e3f').fontSize(24).text('AGRIMAC'); document.fillColor('#354339').fontSize(10).text('Rapport entreprise'); document.moveDown(2).fontSize(20).text('Synthèse d’activité'); document.moveDown().fontSize(12).text(`Entreprise : ${report.company.legalName}`).text(`Généré le : ${report.generatedAt.toISOString()}`).moveDown(); [['Produits', report.products], ['Services', report.services], ['Commandes', report.orders], ['Devis', report.quotes], ['Revenus', `${report.revenueXof.toLocaleString('fr-FR')} FCFA`]].forEach(([label, value]) => document.text(`${label} : ${value}`)); document.end(); }
}
