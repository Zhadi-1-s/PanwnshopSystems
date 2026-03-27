import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';
import { Evaluation, EvaluationSchema } from 'src/core/database/schemas/evaluation.schema';
import { NotificationModule } from '../notification/notification.module';
import { NotificationSchema,Notification } from 'src/core/database/schemas/notifications.schema';
import { SlotModule } from '../slot/slot.module';
import { ProductModule } from '../product/product.module';
import { PawnshopProfile } from 'src/core/database/schemas/shopProfile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Evaluation.name, schema: EvaluationSchema },
      { name: Notification.name, schema: NotificationSchema },
      {name: PawnshopProfile.name,schema: PawnshopProfile}
    ]),
    NotificationModule,
    SlotModule,
    ProductModule
  ],
  controllers: [EvaluationController],
  providers: [EvaluationService],
})
export class EvaluationModule {}
