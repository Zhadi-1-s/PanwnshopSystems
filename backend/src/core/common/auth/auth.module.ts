// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';

import { ConfigModule,ConfigService } from '@nestjs/config';
import { MailService } from '../services/mail.service';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject:[ConfigService],
      useFactory:async (configService:ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn:configService.get<string>('JWT_EXPIRES_IN') },
      })
    }),
  ],
  providers: [AuthService, JwtStrategy, MailService],
  controllers: [AuthController],
})
export class AuthModule {}
