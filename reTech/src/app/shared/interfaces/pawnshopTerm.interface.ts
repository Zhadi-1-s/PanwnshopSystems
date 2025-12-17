export interface PawnshopTerms {
  interestRate?: number;      // процент в день/месяц
  minTermDays?: number;       // минимальная ставка
  maxAmount?: number;        //Максимальная сумма
  fees?: number;             // комиссия
  additional?: string;        // дополнительно
}