import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer,OfferSchema } from 'src/core/database/schemas/offer.schema';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { NotificationModule } from '../notification/notification.module';
import { PawnshopModule } from '../pawnshop/pawnshop.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }]),
    NotificationModule,
    PawnshopModule
  ],
  providers: [OfferService],
  controllers: [OfferController],
  exports: [OfferService],
})
export class OfferModule {}
