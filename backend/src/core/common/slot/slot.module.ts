import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Slot,SlotSchema } from 'src/core/database/schemas/slot.schema';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';
import { from } from 'rxjs';
import { NotificationModule } from '../notification/notification.module';
import { NotificationSchema } from 'src/core/database/schemas/notifications.schema';
import { Notification } from 'src/core/database/schemas/notifications.schema';
import { Offer, OfferSchema } from 'src/core/database/schemas/offer.schema';
import { Product, ProductSchema } from 'src/core/database/schemas/product.schema';
import { Evaluation, EvaluationSchema } from 'src/core/database/schemas/evaluation.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Slot.name, schema: SlotSchema },
                                      {name:Notification.name,schema:NotificationSchema},
                                      {name:Offer.name,schema:OfferSchema},
                                      {name:Product.name,schema:ProductSchema},
                                      {name:Evaluation.name,schema:EvaluationSchema}]),NotificationModule],
  providers: [SlotService],
  controllers: [SlotController],
  exports: [SlotService,MongooseModule],
})
export class SlotModule {}
