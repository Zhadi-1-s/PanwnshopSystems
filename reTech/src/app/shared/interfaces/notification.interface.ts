export interface AppNotification {
  _id?: string;
  userId: string;  // кому
  senderId:string; // от кого
  type: 
    | 'new-offer'
    | 'offer-accepted'
    | 'offer-rejected'
    | 'offer-updated'
    | 'offer-canceled'
    | 'new-message'
    | 'system'
    | 'chat-opened'
    | 'product-sold'
    | 'price-changed'
    | 'offer-in-loan'
    | 'slot-created'
    | 'slot-completed'
    | 'product-expired'
    | 'extend-requested'
    | 'extend-approved'
    | 'extend-rejected'
    | 'evaluation-created'
    | 'evaluation-updated'
    | 'evaluation-accepted';

  title: string;
  message: string;

  refId: string; // ссылка на offerId / chatId / productId

  readBy: [
    {
      userId: string,
      readAt: Date
    }
  ]
  createdAt?: Date;
  data:any;
}
