export interface Message {
  _id?: string;
  fromId: string;         // отправитель
  toId: string;           // получатель
  content: string;
  isRead: boolean;
  createdAt: Date;
}