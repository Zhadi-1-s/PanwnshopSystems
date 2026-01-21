export interface Offer{
    _id?: string; // id оффера из MongoDB
    productId: string; // ObjectId → string
    pawnshopId: string; // ObjectId → string
    productOwnerId: string;
    price: number;
    message?: string;
    status: 'pending' | 'completed' | 'rejected' | 'in_inspection' | 'no_show' | 'rejected_by_pawnshop';
    createdAt?: Date;
    updatedAt?:Date;
    expiresAt?: string | Date;
    cancelReason?: string;
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
     photos: { url: string; publicId: string }[];
 
    expectedPrice?: number;
    termDays:number;
 
    status: 'pending' | 'in_inspection' | 'rejected' | 'no_show';

    createdAt?: Date;

    type:'sale' | 'loan'
}