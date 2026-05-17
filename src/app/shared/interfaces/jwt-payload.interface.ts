export interface JwtPayload {
  sub: string;   // user id
  email: string;
  role: 'user' | 'pawnshop' | 'admin';
  iat?: number;
  exp?: number;
}
