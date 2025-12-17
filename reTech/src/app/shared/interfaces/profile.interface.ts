export interface OwnProfile {
  _id?: string;      // id из MongoDB
  userId: string;    // ObjectId → string
  name: string;
  phone: string;
  location: string;
  avatarUrl?: string;
}