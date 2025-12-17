import { Product } from "./product.interface";
import { Slot } from "./slot.interface";
import { Review } from "./reviews.interface";
import { PawnshopTerms } from "./pawnshopTerm.interface";

export interface PawnshopProfile {
  _id?: string;      // id из MongoDB
  userId: string   // ObjectId → string
  name: string;
  address: string;
  phone: string;
  logoUrl?: string;
  openTime: string;  //  "09:00"
  closeTime: string; //  "18:00"
  workingDays?: string[]; //  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  rating?: number;
  description?: string;
  photos?: string[];
  products:Product[]
  activeSlots:Slot[];
  slotLimit:number;
  createdAt?: Date;
  reviews?: Review[]; 
  terms:PawnshopTerms;
}
