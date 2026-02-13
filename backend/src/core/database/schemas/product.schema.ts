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

  @Prop({ required: true, enum:Status })
  status: Status;
  
  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ required: true, enum: ['sale', 'loan'], default: 'sale' })
  type: 'sale' | 'loan';

  @Prop({
    type: Number,
    min: 1,
    validate: {
      validator: function (value: number) {
        // this.type доступно только при create/update
        if (this.type === 'loan') {
          return value > 0;
        }
        return true; // для sale поле необязательно
      },
      message: 'loanTerm должен быть указан и > 0, если type = loan',
    },
  })
  loanTerm?: number;

}
export const ProductSchema = SchemaFactory.createForClass(Product);
