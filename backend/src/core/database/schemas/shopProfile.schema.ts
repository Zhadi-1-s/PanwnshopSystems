// pawnshop-profile.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Review, ReviewSchema } from './reviews.schema';
import { PawnshopTerms,PawnshopTermsSchema } from './pawnshop-term.schema';

export type PawnshopProfileDocument = PawnshopProfile & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class PawnshopProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  logoUrl?: string;

   @Prop({ required: true})
  openTime: string;

  @Prop({ required: true })
  closeTime: string;


  @Prop({ type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] })
  workingDays: string[];

  @Prop({required:false, default:5})
  rating?: number;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  photos?: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Slot' }], default: [] })
  activeSlots: Types.ObjectId[];

  @Prop({type:Number,required:true})
  slotLimit:number

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  products: Types.ObjectId[];

  @Prop({type:[ReviewSchema], default:[]})
  reviews:Review[]

  @Prop({ type: PawnshopTermsSchema, default: {} })
  terms: PawnshopTerms;

}

export const PawnshopProfileSchema = SchemaFactory.createForClass(PawnshopProfile);
