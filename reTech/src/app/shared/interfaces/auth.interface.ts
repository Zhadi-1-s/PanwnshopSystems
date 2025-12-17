export interface LoginDto{
    email: string;
    password: string;
}
export interface LoginResponse{
    access_token: string;
}
export interface RegisterDto{
    email:string;
    password:string;
    role:string;
    name:string;
    avatarUrl?: string;
}
export interface RegisterResponse{
    access_token: string;
}