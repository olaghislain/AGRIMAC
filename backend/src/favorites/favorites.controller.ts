import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleCode } from '@prisma/client';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedRequestUser } from '../common/auth/auth.types';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { FavoriteDto } from './dto/favorite.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.AGRICULTEUR)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}
  @Get() list(@CurrentUser() user: AuthenticatedRequestUser) { return this.favorites.list(user.userId); }
  @Post() add(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: FavoriteDto) { return this.favorites.add(user.userId, dto); }
  @Delete() remove(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: FavoriteDto) { return this.favorites.remove(user.userId, dto); }
}
