import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RespondQuoteDto } from './dto/respond-quote.dto';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}
  private async company(userId: string) { const company = await this.prisma.companyProfile.findUnique({ where: { userId } }); if (!company) throw new NotFoundException('Profil entreprise introuvable.'); return company; }
  async list(userId: string) { const company = await this.company(userId); return this.prisma.quote.findMany({ where: { companyId: company.id }, include: { request: true, author: { select: { id: true, phone: true } } }, orderBy: { createdAt: 'desc' } }); }
  async respond(userId: string, dto: RespondQuoteDto) { const company = await this.company(userId); const request = await this.prisma.repairRequest.findUnique({ where: { id: dto.requestId } }); if (!request) throw new NotFoundException('Demande introuvable.'); const user = await this.prisma.user.findUnique({ where: { id: userId } }); if (!user) throw new NotFoundException('Utilisateur introuvable.'); return this.prisma.quote.create({ data: { requestId: dto.requestId, authorId: userId, companyId: company.id, amountXof: dto.amountXof, message: dto.message, status: 'SENT' } }); }
}
