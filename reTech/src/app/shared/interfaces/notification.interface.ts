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
    | 'product-expired'

  title: string;
  message: string;

  refId: string; // ссылка на offerId / chatId / productId

  isRead: boolean;
  createdAt?: Date;
  data:any;
}
