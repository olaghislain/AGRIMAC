import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { AccessTokenPayload } from '../common/auth/auth.types';
import { MessagingService } from './messaging.service';
import { SendMessageDto } from './dto/send-message.dto';

type AuthenticatedSocket = Socket & { userId?: string };

@WebSocketGateway({ namespace: '/messaging', cors: { origin: true, credentials: true } })
export class MessagingGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(private readonly jwt: JwtService, private readonly config: ConfigService, private readonly messaging: MessagingService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.tokenFrom(client);
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, { secret: this.config.getOrThrow<string>('JWT_SECRET') });
      if (payload.type !== 'access') throw new Error('Invalid token type');
      client.userId = payload.sub;
      await client.join(`user:${payload.sub}`);
      client.emit('messaging:ready', { userId: payload.sub });
    } catch { client.emit('messaging:error', { message: 'Authentification Socket.IO invalide.' }); client.disconnect(true); }
  }

  @SubscribeMessage('conversation:join')
  async join(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() body: { conversationId: string }) { const userId = this.userId(client); await this.messaging.assertParticipant(userId, body.conversationId); await client.join(`conversation:${body.conversationId}`); return { event: 'conversation:joined', data: { conversationId: body.conversationId } }; }

  @SubscribeMessage('message:send')
  async send(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() body: { conversationId: string } & SendMessageDto) { const result = await this.messaging.send(this.userId(client), body.conversationId, body); this.server.to(`conversation:${body.conversationId}`).emit('message:new', result.message); for (const recipientId of result.recipientIds) this.server.to(`user:${recipientId}`).emit('conversation:updated', { conversationId: body.conversationId, message: result.message }); return { event: 'message:sent', data: result.message }; }

  @SubscribeMessage('conversation:read')
  async read(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() body: { conversationId: string }) { const result = await this.messaging.markRead(this.userId(client), body.conversationId); this.server.to(`conversation:${body.conversationId}`).emit('conversation:read', { userId: this.userId(client), ...result }); return { event: 'conversation:read', data: result }; }

  private userId(client: AuthenticatedSocket) { if (!client.userId) throw new Error('Socket non authentifié.'); return client.userId; }
  private tokenFrom(client: Socket) { const authToken = client.handshake.auth?.token; const header = client.handshake.headers.authorization; const token = typeof authToken === 'string' ? authToken : typeof header === 'string' ? header.replace(/^Bearer\s+/i, '') : ''; if (!token) throw new Error('Missing token'); return token; }
}
