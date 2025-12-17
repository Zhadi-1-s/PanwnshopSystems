// offer.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OfferDocument = Offer & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Offer {
  @Prop({ type: Types.ObjectId, ref: 'ProductId', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PawnshopProfile', required: true })
  pawnshopId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  productOwnerId: Types.ObjectId;

  @Prop({ required: true })
  price: number;

  @Prop()
  message?: string;

  @Prop({ required: true, enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected';
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
