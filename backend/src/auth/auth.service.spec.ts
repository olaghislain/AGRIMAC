import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService password reset', () => {
  it('rejects an expired or missing reset OTP', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1' }) }, otpCode: { findFirst: jest.fn().mockResolvedValue(null) } };
    const service = new AuthService(prisma as never, {} as never, {} as never);
    await expect(service.resetPassword({ phone: '01 97 12 34 56', code: '123456', newPassword: 'new-password-123' })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
