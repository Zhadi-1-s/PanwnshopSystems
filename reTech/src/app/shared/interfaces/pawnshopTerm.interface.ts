export interface PawnshopTerms {
  interest: {
    rate: number;
    period: 'day' | 'month';
    startsAfterDays: number;
    minChargeDays?: number;
  };

  limits: {
    maxAmount: number;
    minAmount?: number;
  };

  fees?: {
    type: 'fixed' | 'percent';
    value: number;
  };

  priceAdjustmentLimitPercent: number; // ±10

  
}
