import { BadRequestException, Controller, Delete, Get, HttpException, Param, ParseUUIDPipe, Post, Res, UploadedFile, UseGuards, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedRequestUser } from '../common/auth/auth.types';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { UploadFileDto } from './dto/upload-file.dto';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a private validated file owned by the authenticated user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: ['file', 'purpose'], properties: { file: { type: 'string', format: 'binary' }, purpose: { type: 'string', enum: ['REQUEST_PHOTO', 'PRODUCT_PHOTO', 'DOCUMENT', 'MESSAGE_ATTACHMENT', 'INVOICE', 'PROFILE_DOCUMENT'] }, resourceType: { type: 'string' }, resourceId: { type: 'string' } } } })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_request, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype)) }))
  async upload(@CurrentUser() user: AuthenticatedRequestUser, @UploadedFile() file: Express.Multer.File, @Body() dto: UploadFileDto) { try { return await this.uploads.save(user.userId, file, dto); } catch (error) { if (error instanceof HttpException) throw error; throw new BadRequestException(error instanceof Error ? error.message : 'Upload invalide.'); } }

  @Get(':id')
  @ApiOperation({ summary: 'Download a private file owned by the authenticated user' })
  async download(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Res() response: Response) { const result = await this.uploads.open(user.userId, id); response.setHeader('Content-Type', result.upload.mimeType); response.setHeader('Content-Disposition', `attachment; filename="${result.upload.originalName.replace(/["\\\r\n]/g, '_')}"`); result.stream.pipe(response); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a private owned file' })
  remove(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.uploads.remove(user.userId, id); }
}
