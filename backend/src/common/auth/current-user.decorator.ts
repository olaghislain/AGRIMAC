import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequestUser } from './auth.types';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedRequestUser => {
  return context.switchToHttp().getRequest<{ user: AuthenticatedRequestUser }>().user;
});
