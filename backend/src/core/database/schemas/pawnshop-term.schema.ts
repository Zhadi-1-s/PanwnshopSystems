// pawnshop-terms.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PawnshopTermsDocument = PawnshopTerms & Document;

@Schema({ _id: false }) // вложенная схема, без отдельного _id
export class PawnshopTerms {
  @Prop({ default: 0 })
  interestRate?: number; // процент в день/месяц

  @Prop({ default: 0 })
  minTermDays?: number; // минимальная ставка

  @Prop({ default: 0 })
  maxAmount?: number; // максимальная сумма

  @Prop({ default: 0 })
  fees?: number; // комиссия

  @Prop({ default: '' })
  additional?: string; // дополнительная информация
}

export const PawnshopTermsSchema = SchemaFactory.createForClass(PawnshopTerms);
