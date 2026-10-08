import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, UploadPurpose } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve, sep } from 'node:path';
import type { Express } from 'express';
import { PrismaService } from '../prisma/prisma.service';

const MAX_SIZE = 10 * 1024 * 1024;
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

@Injectable()
export class UploadsService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async save(ownerId: string, file: Express.Multer.File | undefined, input: { purpose: UploadPurpose; resourceType?: string; resourceId?: string }) {
    if (!file) throw new Error('Un fichier est requis.');
    this.validateFile(file);
    await this.assertResourceAccess(ownerId, input.resourceType, input.resourceId);
    const extension = this.safeExtension(file.originalname, file.mimetype);
    const storageKey = `${ownerId}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;
    const absolutePath = this.absolutePath(storageKey);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.buffer, { flag: 'wx' });
    const sha256 = createHash('sha256').update(file.buffer).digest('hex');
    try {
      return await this.prisma.upload.create({ data: { ownerId, purpose: input.purpose, resourceType: input.resourceType, resourceId: input.resourceId, storageKey, originalName: file.originalname.slice(0, 255), mimeType: file.mimetype, sizeBytes: file.size, sha256 } });
    } catch (error) {
      await unlink(absolutePath).catch(() => undefined);
      throw error;
    }
  }

  async getOwned(ownerId: string, id: string) {
    const upload = await this.prisma.upload.findFirst({ where: { id, ownerId } });
    if (!upload) throw new NotFoundException('Fichier introuvable.');
    return upload;
  }

  async open(ownerId: string, id: string) {
    const upload = await this.getOwned(ownerId, id);
    try { await readFile(this.absolutePath(upload.storageKey)); } catch { throw new NotFoundException('Fichier physique introuvable.'); }
    return { upload, stream: createReadStream(this.absolutePath(upload.storageKey)) };
  }

  async remove(ownerId: string, id: string) {
    const upload = await this.getOwned(ownerId, id);
    await this.prisma.upload.delete({ where: { id } });
    await unlink(this.absolutePath(upload.storageKey)).catch(() => undefined);
    return { success: true };
  }

  private validateFile(file: Express.Multer.File) {
    if (file.size > MAX_SIZE) throw new Error('La taille maximale est de 10 Mo.');
    if (!allowedMimeTypes.has(file.mimetype)) throw new Error('Type de fichier non autorisé.');
    if (!file.originalname || file.originalname.includes('\0')) throw new Error('Nom de fichier invalide.');
    if (file.mimetype === 'application/pdf' && !file.buffer.subarray(0, 5).toString('ascii').startsWith('%PDF-')) throw new Error('Le contenu PDF est invalide.');
    if (file.mimetype === 'image/png' && file.buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Le contenu PNG est invalide.');
    if (file.mimetype === 'image/jpeg' && !(file.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[file.buffer.length - 2] === 0xff && file.buffer[file.buffer.length - 1] === 0xd9)) throw new Error('Le contenu JPEG est invalide.');
  }

  private safeExtension(originalName: string, mimeType: string) { const byMime: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'application/pdf': '.pdf', 'application/msword': '.doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx' }; return byMime[mimeType] || extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '') || '.bin'; }
  private absolutePath(storageKey: string) { const root = resolve(this.config.get('UPLOAD_DIR', join(process.cwd(), 'storage', 'private'))); const path = resolve(root, storageKey); if (!path.startsWith(`${root}${sep}`)) throw new ForbiddenException('Chemin de fichier invalide.'); return path; }
  private async assertResourceAccess(ownerId: string, resourceType?: string, resourceId?: string) {
    if (!resourceType && !resourceId) return;
    if (!resourceType || !resourceId) throw new ForbiddenException('La ressource du fichier est incomplète.');
    if (resourceType === 'REQUEST' && !await this.prisma.repairRequest.findFirst({ where: { id: resourceId, OR: [{ requesterId: ownerId }, { assigneeId: ownerId }] } })) throw new ForbiddenException('Accès à la demande refusé.');
    if (resourceType === 'PRODUCT' && !await this.prisma.product.findFirst({ where: { id: resourceId, company: { userId: ownerId } } })) throw new ForbiddenException('Accès au produit refusé.');
    if (resourceType === 'SERVICE' && !await this.prisma.service.findFirst({ where: { id: resourceId, OR: [{ company: { userId: ownerId } }, { technician: { userId: ownerId } }] } })) throw new ForbiddenException('Accès au service refusé.');
    if (resourceType === 'MESSAGE' && !await this.prisma.message.findFirst({ where: { id: resourceId, OR: [{ senderId: ownerId }, { conversation: { participants: { some: { userId: ownerId } } } }] } })) throw new ForbiddenException('Accès au message refusé.');
  }
}
