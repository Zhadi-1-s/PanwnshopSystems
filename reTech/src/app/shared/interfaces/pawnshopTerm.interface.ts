export interface PawnshopTerms {
  interest: {
    rate: number;
    
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

  minLoanTermDays?: number;
  prolongationAllowed?: boolean;
  lateFeePercent?: number;

  
}
