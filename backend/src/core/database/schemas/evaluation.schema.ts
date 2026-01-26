import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type EvaluationDocument = HydratedDocument<Evaluation> & {createdAt: Date; updatedAt: Date;};

@Schema({ timestamps: {createdAt:true, updatedAt:true} })
export class Evaluation extends Document {

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userTelephoneNumber: string;

  @Prop({ required: true })
  pawnshopId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: ['new', 'good', 'used', 'broken'] })
  condition: 'new' | 'good' | 'used' | 'broken';

  @Prop({
    type: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
      }
    ],
    default: []
  })
  photos: {
    url: string;
    publicId: string;
  }[];

  @Prop()
  expectedPrice?: number;

  @Prop()
  termDays:number

  @Prop({ required: true, enum: ['pending', 'in_inspection', 'rejected','no_show'], default: 'pending' })
  status: 'pending'|'in_inspection'|'rejected'|'no_show';

  @Prop({ required: false })
  expiresAt: Date;

  @Prop({required:false})
  cancelReason?: string;

}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);
