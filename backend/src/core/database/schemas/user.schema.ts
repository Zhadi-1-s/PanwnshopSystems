// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document ,Types} from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User {
  @Prop({required:true})
  name:string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['user', 'pawnshop', 'admin']})
  role: 'user' | 'pawnshop' | 'admin';

  @Prop({required:true})
  avatarUrl:string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'PawnshopProfile' }], default: [] })
  favoritePawnshops: Types.ObjectId[];

  @Prop({type:[{type:Types.ObjectId, ref:'Product'}] , default:[]})
  favoriteItems:Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
