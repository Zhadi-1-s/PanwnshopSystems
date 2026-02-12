import { LoanStatus, Status } from "../enums/status.enum";
import { Product } from "./product.interface";

// slot.interface.ts
export interface Slot {
  _id?: string;
  product:any;              
  pawnshopId: any;         
  userId: string;               
  loanAmount: number;           // сумма займа
  startDate: Date;              
  endDate: Date;               
  interestRate: number;         // процент, например 0.5 (0.5% в день)
  status: LoanStatus
  createdAt?: Date;
  updatedAt?: Date;
}
