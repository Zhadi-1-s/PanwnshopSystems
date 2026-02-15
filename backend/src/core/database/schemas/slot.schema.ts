import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LoanStatus, Status } from 'src/core/common/enums/status.enum';
import { Product } from './product.schema';
export type SlotDocument = Slot & Document;

@Schema({ timestamps: true })
export class Slot {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product:Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PawnshopProfile', required: true })
  pawnshopId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  loanAmount: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, min: 0 })
  interestRate: number;

  @Prop({
    type: String,
    enum: LoanStatus,
    default: LoanStatus.ACTIVE,
  })
  status: LoanStatus;
}
export const SlotSchema = SchemaFactory.createForClass(Slot);
