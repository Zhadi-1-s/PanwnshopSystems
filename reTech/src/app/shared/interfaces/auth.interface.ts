export interface LoginDto{
    email: string;
    password: string;
}
export interface LoginResponse{
    accessToken: string;
    refreshToken: string;
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