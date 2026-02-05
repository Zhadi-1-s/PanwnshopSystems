import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer,OfferSchema } from 'src/core/database/schemas/offer.schema';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { NotificationModule } from '../notification/notification.module';
import { PawnshopModule } from '../pawnshop/pawnshop.module';
import { NotificationSchema ,Notification} from 'src/core/database/schemas/notifications.schema';
import { ProductService } from '../product/product.service';
import { SlotService } from '../slot/slot.service';
import { ProductModule } from '../product/product.module';
import { SlotModule } from '../slot/slot.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema },{name:Notification.name,schema:NotificationSchema}]),
    NotificationModule,
    PawnshopModule,
    ProductModule,
    SlotModule
  ],
  providers: [OfferService],
  controllers: [OfferController],
  exports: [OfferService],
})
export class OfferModule {}
