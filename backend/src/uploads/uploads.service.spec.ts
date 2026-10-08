import { UploadsService } from './uploads.service';

describe('UploadsService', () => {
  it('rejects a file whose MIME content does not match', async () => {
    const service = new UploadsService({} as never, { get: jest.fn().mockReturnValue('C:\\tmp\\agrimac-uploads') } as never);
    const file = { originalname: 'photo.png', mimetype: 'image/png', size: 3, buffer: Buffer.from('bad') } as Express.Multer.File;

    await expect(service.save('user-1', file, { purpose: 'REQUEST_PHOTO' as never })).rejects.toThrow('contenu PNG est invalide');
  });

  it('rejects access to a resource owned by another user', async () => {
    const prisma = { repairRequest: { findFirst: jest.fn().mockResolvedValue(null) } };
    const service = new UploadsService(prisma as never, { get: jest.fn() } as never);
    const file = { originalname: 'doc.pdf', mimetype: 'application/pdf', size: 5, buffer: Buffer.from('%PDF-1') } as Express.Multer.File;

    await expect(service.save('user-1', file, { purpose: 'DOCUMENT' as never, resourceType: 'REQUEST', resourceId: 'request-1' })).rejects.toThrow('Accès à la demande refusé');
  });
});
