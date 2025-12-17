// own-profile.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OwnProfileDocument = OwnProfile & Document;

@Schema()
export class OwnProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  location: string;

  @Prop()
  avatarUrl?: string;
}

export const OwnProfileSchema = SchemaFactory.createForClass(OwnProfile);
