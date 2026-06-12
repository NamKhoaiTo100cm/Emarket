import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ChatService } from './chat.service';
import { CreateShopConversationDto, CreateSupportConversationDto, MarkReadDto } from './chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private chatService: ChatService) { }

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

    @Roles('staff', 'admin')
    @Get('support/conversations/all')
    async getSupportConversationsNotAssigned() {
        return this.chatService.getSupportConversationsNotAssigned();
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

    @Roles('staff', 'admin')
    @Patch('support/conversation/assign')
    async assignStaff(@Body() body: { conversationId: number }, @Req() req) {
        return this.chatService.assignStaff(body.conversationId, req.user.id);
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
