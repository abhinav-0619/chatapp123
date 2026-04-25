import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
// chat.gateway.ts
import { Message } from '../generated/prisma/index.js';
import { randomUUID } from 'crypto'; // add this

// ✅ Strong typing (no "any")
interface MessageData {
  content: string;
  chatId: string;
  senderId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private prisma: PrismaService) {}

  // ✅ Fix: definite assignment
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log('User connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('User disconnected:', client.id);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: MessageData,
    @ConnectedSocket() client: Socket,
  ) {
    const { content, chatId, senderId } = data;

    // ✅ Strongly typed Prisma result
    const message: Message = await this.prisma.message.create({
      data: {
        id: randomUUID(), // ✅ required — no @default(uuid()) in schema
        content,
        chatId,
        senderId,
      },
    });
    this.server.emit('receive_message', message);
  }
}