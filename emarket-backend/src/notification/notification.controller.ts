import { Controller, Get, Patch, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.notificationService.getNotifications(userId, parseInt(page), parseInt(limit));
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req) {
    const userId = req.user.id;
    return this.notificationService.getUnreadCount(userId);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req) {
    const userId = req.user.id;
    return this.notificationService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.id;
    return this.notificationService.markAsRead(userId, id);
  }
}
