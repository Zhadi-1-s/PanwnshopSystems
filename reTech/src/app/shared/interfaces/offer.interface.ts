export interface Offer{
    _id?: string; // id оффера из MongoDB
    productId: string; // ObjectId → string
    pawnshopId: string; // ObjectId → string
    productOwnerId: string;
    price: number;
    message?: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt?: Date;
}
export interface Evaluation{
   _id?: string;

  // кто отправил
    userId: string;
    userTelephoneNumber:string;
    pawnshopId: string;

    title: string;
    description?: string;
    condition: 'new' | 'good' | 'used' | 'broken';
    photos: string[];
 
    expectedPrice?: number;
    termDays:number;
  // статус обработки
    status: 'pending' | 'viewed' | 'responded';

    createdAt?: Date;
}