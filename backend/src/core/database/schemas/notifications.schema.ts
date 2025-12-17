import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

export type NotificationType =
  | 'new-offer'
  | 'offer-accepted'
  | 'offer-rejected'
  | 'new-message'
  | 'system'
  | 'chat-opened'
  | 'product-sold'
  | 'price-changed';

@Schema({ timestamps: true })
export class Notification {

  @Prop({ required: true })
  userId: string; 

  @Prop()
  senderId?:string;

  @Prop({
    required: true,
    enum: [
      'new-offer',
      'offer-accepted',
      'offer-rejected',
      'new-message',
      'system',
      'chat-opened',
      'product-sold',
      'price-changed',
    ],
  })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop()
  message?: string;

  @Prop()
  refId?: string; // ссылка на продукт / оффер / чат

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Индексы
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });