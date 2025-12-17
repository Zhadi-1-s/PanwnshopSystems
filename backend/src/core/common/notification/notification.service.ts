import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification,NotificationDocument } from 'src/core/database/schemas/notifications.schema';
import { CreateNotificationDto } from './notification.dto';

@Injectable()
export class NotificationService {

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(dto: CreateNotificationDto) {
    return this.notificationModel.create(dto);
  }

  async findOne(filter: any) {
    return this.notificationModel.findOne(filter).exec();
  }

  async getUserNotifications(userId: string) {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(id: string) {
    return this.notificationModel.findByIdAndUpdate(id, { isRead: true });
  }

  async unreadCount(userId: string) {
    return this.notificationModel.countDocuments({ userId, isRead: false });
  }
}
