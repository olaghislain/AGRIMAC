import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedRequestUser } from '../common/auth/auth.types';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ListConversationsDto } from './dto/list-conversations.dto';
import { ListMessagesDto } from './dto/list-messages.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagingGateway } from './messaging.gateway';
import { MessagingService } from './messaging.service';

@ApiTags('messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class MessagingController {
  constructor(private readonly messaging: MessagingService, private readonly gateway: MessagingGateway) {}

  @Get() @ApiOperation({ summary: 'List conversations for the authenticated user' }) list(@CurrentUser() user: AuthenticatedRequestUser, @Query() query: ListConversationsDto) { return this.messaging.list(user.userId, query); }
  @Post() @ApiOperation({ summary: 'Create a conversation between AGRIMAC users' }) create(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreateConversationDto) { return this.messaging.create(user.userId, dto); }
  @Get(':id') @ApiOperation({ summary: 'Get one conversation when the user is a participant' }) get(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.messaging.get(user.userId, id); }
  @Get(':id/messages') @ApiOperation({ summary: 'List messages in a conversation' }) messages(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Query() query: ListMessagesDto) { return this.messaging.messages(user.userId, id, query); }
  @Post(':id/messages') @ApiOperation({ summary: 'Send a message and notify other participants' }) async send(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SendMessageDto) { const result = await this.messaging.send(user.userId, id, dto); this.gateway.server.to(`conversation:${id}`).emit('message:new', result.message); for (const recipientId of result.recipientIds) this.gateway.server.to(`user:${recipientId}`).emit('conversation:updated', { conversationId: id, message: result.message }); return result.message; }
  @Patch(':id/read') @ApiOperation({ summary: 'Mark a conversation messages as read' }) async read(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { const result = await this.messaging.markRead(user.userId, id); this.gateway.server.to(`conversation:${id}`).emit('conversation:read', { userId: user.userId, ...result }); return result; }
  @Patch(':id/archive') @ApiOperation({ summary: 'Archive a conversation for the current user' }) archive(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.messaging.archive(user.userId, id, true); }
  @Patch(':id/unarchive') @ApiOperation({ summary: 'Restore an archived conversation' }) unarchive(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.messaging.archive(user.userId, id, false); }
  @Delete(':id') @ApiOperation({ summary: 'Soft-delete a conversation for the current user' }) removeConversation(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.messaging.removeConversation(user.userId, id); }
  @Delete('messages/:messageId') @ApiOperation({ summary: 'Soft-delete an owned message' }) removeMessage(@CurrentUser() user: AuthenticatedRequestUser, @Param('messageId', ParseUUIDPipe) id: string) { return this.messaging.deleteMessage(user.userId, id); }
}
