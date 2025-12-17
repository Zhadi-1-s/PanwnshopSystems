// product.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from 'src/core/common/enums/category.enum';
import { Status } from 'src/core/common/enums/status.enum';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: Category,
    required: true,
  })
  category: Category;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ required: true, enum:Status, default: 'open' })
  status: Status;
  
  @Prop({ required: true, type: Number, min: 0 })
  price: number;

}
export const ProductSchema = SchemaFactory.createForClass(Product);
