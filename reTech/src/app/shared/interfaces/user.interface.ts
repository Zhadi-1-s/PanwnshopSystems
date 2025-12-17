
export interface User{
    _id?: string; // из MongoDB
    name:string;
    email: string;
    password: string; 
    role: 'user' | 'pawnshop' | 'admin';
    createdAt?: Date; // добавляется через timestamps
    avatarUrl:string;
    favoritePawnshops:string[]; 
    favoriteItems:string[];
}