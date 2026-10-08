import { ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  it('prevents an administrator from changing their own status', async () => {
    const service = new AdminService({} as never);
    await expect(service.updateUserStatus('same-id', 'same-id', { status: 'SUSPENDED' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('writes an audit log when changing a user status', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'target-id', status: 'SUSPENDED' });
    const audit = jest.fn().mockResolvedValue({});
    const transaction = { user: { update }, auditLog: { create: audit } };
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ id: 'target-id', status: 'ACTIVE' }) }, $transaction: jest.fn(async callback => callback(transaction)) };
    const service = new AdminService(prisma as never);
    await service.updateUserStatus('admin-id', 'target-id', { status: 'SUSPENDED', note: 'Test' });
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ actorId: 'admin-id', entityId: 'target-id', action: 'USER_STATUS_SUSPENDED' }) }));
  });
});
