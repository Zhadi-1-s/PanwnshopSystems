export enum Status{
    ACTIVE = 'active',
    CLOSED = 'closed',
    EXPIRED = 'expired',
    SOLD = 'sold'
}
export enum LoanStatus {
  ACTIVE = 'active',     // займ открыт
  CLOSED = 'closed',     // погашен
  EXPIRED = 'expired',   // просрочен
  SOLD = 'sold'          // товар продали из-за просрочки
}
export enum ProductStatus {
  ACTIVE = 'active',     // доступен, можно взять займ
  IN_LOAN = 'in_loan',   // сейчас в залоге
  INACTIVE = 'inactive', // временно не используется
  SOLD = 'sold'          // продан ломбардом
}