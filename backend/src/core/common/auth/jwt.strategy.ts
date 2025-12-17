// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // JWT достаём из Authorization: Bearer <token>
      ignoreExpiration: false, // токен с истёкшим сроком недействителен
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-key', // должен совпадать с auth.module.ts
    });
  }

  async validate(payload: any) {
    // payload — это данные, которые мы зашили в токен при login
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
