import { Controller, Get, Param, Patch, Body, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './notification.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Get('user/:id')
  getUserNotifications(@Param('id') userId: string) {
    return this.notificationService.getUserNotifications(userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Get('user/:id/unread-count')
  getUnreadCount(@Param('id') userId: string) {
    return this.notificationService.unreadCount(userId);
  }
}
