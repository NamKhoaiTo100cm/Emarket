import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CreateShopConversationDto, CreateSupportConversationDto, MarkReadDto } from './chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(
        private chatService: ChatService,
        private chatGateway: ChatGateway,
    ) { }

    // ==================== SHOP CHAT ====================

    @Post('conversation')
    async getOrCreateShopConversation(@Body() dto: CreateShopConversationDto, @Req() req) {
        return this.chatService.getOrCreateShopConversation(req.user.id, dto.shopId);
    }

    @Get('conversations/user')
    async getUserConversations(@Req() req) {
        return this.chatService.getUserConversations(req.user.id);
    }

    @Get('conversations/seller')
    async getSellerConversations(@Req() req) {
        return this.chatService.getSellerConversations(req.user.id);
    }

    // ==================== SUPPORT CHAT ====================

    @Post('support/conversation')
    async getOrCreateSupportConversation(@Body() dto: CreateSupportConversationDto, @Req() req) {
        return this.chatService.getOrCreateSupportConversation(req.user.id, dto.type === 'shop');
    }

    /** Tất cả conversations chưa assign (staff/admin thấy để nhận) */
    @Roles('staff', 'admin')
    @Get('support/conversations/all')
    async getSupportConversationsUnassigned() {
        return this.chatService.getSupportConversationsUnassigned();
    }

    /** Conversations đã assign cho staff đang đăng nhập */
    @Roles('staff', 'admin')
    @Get('support/conversations/mine')
    async getMyAssignedConversations(@Req() req) {
        return this.chatService.getMyAssignedConversations(req.user.id);
    }

    @Roles('staff', 'admin')
    @Get('support/conversations/users')
    async getUserSupportConversationsNotAssigned() {
        return this.chatService.getUserSupportConversationsNotAssigned();
    }

    @Roles('staff', 'admin')
    @Get('support/conversations/shops')
    async getShopSupportConversationsNotAssigned() {
        return this.chatService.getShopSupportConversationsNotAssigned();
    }

    /** Staff nhận conversation (assign) — emit real-time cho tất cả staff */
    @Roles('staff', 'admin')
    @Patch('support/conversation/assign')
    async assignStaff(@Body() body: { conversationId: number }, @Req() req) {
        const conversation = await this.chatService.assignStaff(body.conversationId, req.user.id);
        this.chatGateway.emitConversationAssigned(body.conversationId, req.user.id, conversation);
        return conversation;
    }

    /** Staff kết thúc hỗ trợ (unassign) — emit real-time cho tất cả staff */
    @Roles('staff', 'admin')
    @Patch('support/conversation/unassign')
    async unassignStaff(@Body() body: { conversationId: number }, @Req() req) {
        const conversation = await this.chatService.unassignStaff(body.conversationId, req.user.id);
        this.chatGateway.emitConversationUnassigned(body.conversationId, conversation);
        return conversation;
    }

    // ==================== SHARED ====================

    @Get('conversation/:id/messages')
    async getMessages(@Param('id', ParseIntPipe) id: number) {
        return this.chatService.getMessages(id);
    }

    @Patch('conversation/:id/read')
    async markRead(@Param('id', ParseIntPipe) id: number, @Body() dto: MarkReadDto) {
        return this.chatService.markAsRead(id, dto.role);
    }
}
