import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { AuthenticatedRequestUser } from '../common/auth/auth.types';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedRequestUser) { return this.users.me(user.userId); }

  @Patch('me')
  update(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: UpdateMeDto) { return this.users.updateMe(user.userId, dto); }

  @Get('me/preferences')
  preferences(@CurrentUser() user: AuthenticatedRequestUser) { return this.users.getPreferences(user.userId); }

  @Patch('me/preferences')
  updatePreferences(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: UpdatePreferencesDto) { return this.users.updatePreferences(user.userId, dto); }
}
