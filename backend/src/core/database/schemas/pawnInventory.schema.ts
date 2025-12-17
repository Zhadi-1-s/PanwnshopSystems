// pawn-inventory-item.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PawnInventoryItemDocument = PawnInventoryItem & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class PawnInventoryItem {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  pawnshopId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: true })
  available: boolean;
}

export const PawnInventoryItemSchema = SchemaFactory.createForClass(PawnInventoryItem);
