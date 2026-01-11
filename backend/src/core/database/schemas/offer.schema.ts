// offer.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type OfferDocument = HydratedDocument<Offer> & {createdAt: Date; updatedAt: Date;};

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
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

  @Prop({
    type:String,
    required: true,
    enum: ['pending', 'completed', 'rejected','in_inspection'],
    default: 'pending'
  })
  status: 'pending' | 'completed' | 'rejected' | 'in_inspection';

  // 👇 поле, по которому Mongo будет удалять документ
  @Prop({ required: true })
  expiresAt: Date;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
