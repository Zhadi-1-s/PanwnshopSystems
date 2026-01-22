// pawnshop-terms.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PawnshopTermsDocument = PawnshopTerms & Document;

@Schema({ _id: false }) // вложенная схема, без отдельного _id
export class PawnshopTerms {

  @Prop({
    type: () => Object,
    default: {
      rate: 0,
      period: 'month',
      startsAfterDays: 0,
      minChargeDays: null
    }
  })
  interest: {
    rate: number;
    period: 'day' | 'month';
    startsAfterDays: number;
    minChargeDays?: number;
  };

  @Prop({
    type: () => Object,
    default: {
      maxAmount: 0,
      minAmount: null
    }
  })
  limits: {
    maxAmount: number;
    minAmount?: number;
  };

  @Prop({
    type: () => Object,
    default: {
      type: 'percent',
      value: 0
    }
  })
  fees?: {
    type: 'fixed' | 'percent';
    value: number;
  };

  @Prop({ default: 0 })
  priceAdjustmentLimitPercent: number;
}

export const PawnshopTermsSchema = SchemaFactory.createForClass(PawnshopTerms);
