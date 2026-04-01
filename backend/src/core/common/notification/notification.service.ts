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

  async createMany(dtos: CreateNotificationDto[]) {
    return this.notificationModel.insertMany(dtos);
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

  async markAsRead(id: string, userId: string) {
    return this.notificationModel.updateOne(
      { _id: id, 'readBy.userId': { $ne: userId } }, // чтобы не было дублей
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date()
          }
        }
      }
    );
  }

 async unreadCount(userId: string) {
    return this.notificationModel.countDocuments({
      userId,
      'readBy.userId': { $ne: userId }
    });
  }

}
