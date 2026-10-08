import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedRequestUser } from '../common/auth/auth.types';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List persisted notifications with pagination and unread filtering' })
  list(@CurrentUser() user: AuthenticatedRequestUser, @Query() query: ListNotificationsDto) { return this.notifications.list(user.userId, query); }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one notification as read' })
  read(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.notifications.markRead(user.userId, id); }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  readAll(@CurrentUser() user: AuthenticatedRequestUser) { return this.notifications.markAllRead(user.userId); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete one owned notification' })
  remove(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.notifications.remove(user.userId, id); }
}
