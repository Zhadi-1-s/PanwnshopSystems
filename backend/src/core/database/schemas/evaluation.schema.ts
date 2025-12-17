import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
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

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop()
  expectedPrice?: number;

  @Prop()
  termDays:number

  @Prop({ required: true, enum: ['pending', 'viewed', 'responded'], default: 'pending' })
  status: 'pending' | 'viewed' | 'responded';
}

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);
