import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
        credentials: true,
    },
    namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private chatService: ChatService) { }

    handleConnection(client: Socket) {
        const userId = client.handshake.auth.userId;
        if (!userId) return client.disconnect();
        client.join(`user:${userId}`);
        console.log(`[Chat] Client connected: ${client.id}, userId: ${userId}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`[Chat] Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join_conversation')
    handleJoin(client: Socket, conversationId: number) {
        client.join(`conversation:${conversationId}`);
        console.log(`[Chat] Client ${client.id} joined conversation:${conversationId}`);
    }

    @SubscribeMessage('leave_conversation')
    handleLeave(client: Socket, conversationId: number) {
        client.leave(`conversation:${conversationId}`);
    }

    @SubscribeMessage('send_message')
    async handleMessage(client: Socket, payload: any) {
        try {
            const message = await this.chatService.saveMessage(payload);
            // Emit tới tất cả trong room (bao gồm cả người gửi)
            this.server
                .to(`conversation:${payload.conversationId}`)
                .emit('new_message', message);
        } catch (err) {
            console.error('[Chat] Error saving message:', err.message);
            client.emit('error', { message: 'Không thể gửi tin nhắn' });
        }
    }

    @SubscribeMessage('mark_read')
    async handleMarkRead(
        client: Socket,
        payload: { conversationId: number; role: 'user' | 'seller' | 'staff' },
    ) {
        try {
            await this.chatService.markAsRead(payload.conversationId, payload.role);
        } catch (err) {
            console.error('[Chat] Error marking read:', err.message);
        }
    }
}
