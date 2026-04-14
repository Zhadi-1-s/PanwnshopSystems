import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import mongoose, { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

export type NotificationType =
    | 'new-offer'
    | 'offer-accepted'
    | 'offer-rejected'
    | 'offer-updated'
    | 'offer-cancelled'
    | 'offer-completed'
    | 'offer-in-loan'
    | 'new-message'
    | 'system'
    | 'chat-opened'
    | 'product-sold'
    | 'price-changed'
    | 'offer-in-loan'
    | 'slot-created'
    | 'slot-updated'
    | 'slot-completed'
    | 'slot-expired'
    | 'product-expired'
    | 'evaluation-created'
    | 'evaluation-updated'
    | 'evaluation-accepted'
    | 'extend-requested'
    | 'extend-approved'
    | 'extend-rejected';

@Schema({ timestamps: true })
export class Notification {

  @Prop({ required: true })
  userId!: string; 

  @Prop()
  senderId?:string;

  @Prop({
    required: true,
    enum: [
      'new-offer',
      'offer-accepted',
      'offer-rejected',
      'offer-cancelled',
      'offer-updated',
      'offer-completed',
      'offer-in-loan',
      'new-message',
      'system',
      'chat-opened',
      'product-sold',
      'price-changed',
      'offer-in-loan',
      'evaluation-updated',
      'evaluation-accepted',
      'evaluation-created',
      'slot-created',
      'slot-completed',
      'slot-updated',
      'slot-expired',
      'product-expired',
      'extend-requested',
      'extend-approved',
      'extend-rejected'
    ],
  })
  type!: NotificationType;

  @Prop({ required: true })
  title!: string;

  @Prop()
  message?: string;

  @Prop()
  refId?: string; // ссылка на продукт / оффер / чат

  @Prop({
    type: [
      {
        userId: { type: String, required: true },
        readAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  })
  readBy!: {
    userId: string;
    readAt: Date;
  }[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  data?: any;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Индексы
NotificationSchema.index({ userId: 1, 'readBy.userId': 1 });
NotificationSchema.index({ createdAt: -1 });