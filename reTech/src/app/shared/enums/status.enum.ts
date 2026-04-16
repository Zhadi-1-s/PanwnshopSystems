export enum Status{
    ACTIVE = 'active',
    CLOSED = 'closed',
    EXPIRED = 'expired',
    SOLD = 'sold'
}
export enum ProductStatus {
  ACTIVE = 'active',     // доступен, можно взять займ
  IN_LOAN = 'in_loan',   // сейчас в залоге
  INACTIVE = 'inactive', // временно не используется
  SOLD = 'sold'          // продан ломбардом
}
export enum LoanStatus {
  ACTIVE = 'active',     // займ открыт
  COMPLETED = 'completed',
  CLOSED = 'closed',     // закрыт
  EXPIRED = 'expired',   // просрочен
  SOLD = 'sold',       // товар продали из-за просрочки
  EXTEND_REQUESTED = 'extend_requested',
  FORFEITED = 'forfeited'
}
export enum SlotCloseReason {
  NON_PAYMENT = 'non_payment',
  MANUAL = 'manual',
  EARLY_REPAYMENT = 'early_repayment',
  ADMIN_FORCE = 'admin_force',
}