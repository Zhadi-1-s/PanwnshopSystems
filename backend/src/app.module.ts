import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './core/common/auth/auth.module';
import { UserModule } from './core/common/user/user.module';
import { ServiceModule } from './core/common/services/services.module';
import { PawnshopModule } from './core/common/pawnshop/pawnshop.module';
import { ProductModule } from './core/common/product/product.module';
import { SlotModule } from './core/common/slot/slot.module';
import { NotificationModule } from './core/common/notification/notification.module';
import { OfferModule } from './core/common/offer/offer.module';
import { EvaluationModule } from './core/common/evaluation/evalutaion.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    ServiceModule,
    PawnshopModule,
    ProductModule,
    SlotModule,
    NotificationModule,
    OfferModule,
    EvaluationModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}