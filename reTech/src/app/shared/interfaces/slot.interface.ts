import { Status } from "../enums/status.enum";
import { Product } from "./product.interface";

// slot.interface.ts
export interface Slot {
  _id?: string;
  product:string;              
  pawnshopId: string;         
  userId: string;               
  loanAmount: number;           // сумма займа
  startDate: Date;              
  endDate: Date;               
  interestRate: number;         // процент, например 0.5 (0.5% в день)
  status: Status
  createdAt?: Date;
  updatedAt?: Date;
}
