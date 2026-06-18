import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

/** Thời gian chờ (ms) trước khi auto-unassign khi staff disconnect — 5 phút */
const STAFF_AUTO_UNASSIGN_DELAY_MS = 5 * 60 * 1000;

@WebSocketGateway({
    cors: {
        origin: (origin, callback) => {
            const frontendUrl = process.env.FRONTEND_URL;
            if (
                !origin ||
                origin.startsWith('http://localhost') ||
                origin.endsWith('.vercel.app') ||
                (frontendUrl && origin === frontendUrl)
            ) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    },
    namespace: '/chat',
    transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private chatService: ChatService) { }

    /**
     * Map: userId → Set của socket IDs đang kết nối.
     * Dùng để biết staff còn bao nhiêu tab/cửa sổ đang mở.
     */
    private userSockets = new Map<number, Set<string>>();

    /**
     * Map: staffId → timeout handle.
     * Nếu staff reconnect trước khi timeout hết → clear timer.
     */
    private autoUnassignTimers = new Map<number, NodeJS.Timeout>();

    handleConnection(client: Socket) {
        const userId = Number(client.handshake.auth.userId);
        if (!userId) return client.disconnect();

        client.join(`user:${userId}`);
        console.log(`[Chat] Connected: socketId=${client.id}, userId=${userId}`);

        // Đăng ký socket vào tracking
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(client.id);

        // Nếu staff reconnect trước khi timer kích hoạt → hủy timer
        if (this.autoUnassignTimers.has(userId)) {
            clearTimeout(this.autoUnassignTimers.get(userId)!);
            this.autoUnassignTimers.delete(userId);
            console.log(`[Chat] Staff ${userId} reconnected — auto-unassign timer cancelled`);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = Number(client.handshake.auth.userId);
        console.log(`[Chat] Disconnected: socketId=${client.id}, userId=${userId}`);

        if (!userId) return;

        // Xóa socket này khỏi tracking
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            sockets.delete(client.id);
            if (sockets.size === 0) {
                this.userSockets.delete(userId);

                // Staff không còn socket nào → bắt đầu đếm ngược auto-unassign
                // (bao gồm page refresh, đóng tab, mất mạng tạm thời)
                const timer = setTimeout(async () => {
                    await this.performAutoUnassign(userId);
                }, STAFF_AUTO_UNASSIGN_DELAY_MS);

                this.autoUnassignTimers.set(userId, timer);
                console.log(`[Chat] Staff ${userId} fully disconnected — auto-unassign in ${STAFF_AUTO_UNASSIGN_DELAY_MS / 1000}s`);
            }
        }
    }

    /** Thực hiện auto-unassign tất cả conversations của staff */
    private async performAutoUnassign(staffId: number) {
        try {
            const unassigned = await this.chatService.unassignAllForStaff(staffId);
            if (unassigned.length > 0) {
                console.log(`[Chat] Auto-unassigned ${unassigned.length} conversation(s) for staff ${staffId}`);
                unassigned.forEach((conv) => {
                    this.emitConversationUnassigned(conv.id, conv);
                });
            }
        } catch (err) {
            console.error(`[Chat] Error during auto-unassign for staff ${staffId}:`, err.message);
        } finally {
            this.autoUnassignTimers.delete(staffId);
        }
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

    /** Staff join room chung để nhận thông báo assign/unassign real-time */
    @SubscribeMessage('join_staff_support')
    handleJoinStaffSupport(client: Socket) {
        client.join('staff_support');
        console.log(`[Chat] Staff client ${client.id} joined staff_support room`);
    }

    @SubscribeMessage('leave_staff_support')
    handleLeaveStaffSupport(client: Socket) {
        client.leave('staff_support');
    }

    @SubscribeMessage('send_message')
    async handleMessage(client: Socket, payload: any) {
        try {
            const message = await this.chatService.saveMessage(payload);
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

    /** Được gọi từ controller sau khi assign thành công */
    emitConversationAssigned(conversationId: number, staffId: number, conversation: any) {
        this.server.to('staff_support').emit('conversation_assigned', {
            conversationId,
            assignedStaffId: staffId,
            conversation,
        });
    }

    /** Được gọi từ controller/auto-unassign sau khi unassign */
    emitConversationUnassigned(conversationId: number, conversation: any) {
        this.server.to('staff_support').emit('conversation_unassigned', {
            conversationId,
            conversation,
        });
    }
}
