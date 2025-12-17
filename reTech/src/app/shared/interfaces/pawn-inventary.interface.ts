export interface PawnInventoryItem {
  _id?: string; // id из MongoDB
  pawnshopId: string; // ObjectId → string
  title: string;
  description?: string;
  category: string;
  photos: string[];
  price: number;
  available: boolean;
  createdAt?: Date;
}