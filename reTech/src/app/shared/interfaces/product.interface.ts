import { Category } from "../enums/category.enum";
import { Status } from "../enums/status.enum";
export interface Product {
  _id?: string; // id из MongoDB
  ownerId: string; // ObjectId → string
  title: string;
  description?: string;
  category: Category;
  photos: { url: string; publicId: string }[];
  status: Status;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
  type:'sale' | 'loan';
  loanTerm?:number;
}