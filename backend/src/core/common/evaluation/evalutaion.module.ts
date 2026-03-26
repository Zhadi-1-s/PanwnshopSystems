import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';
import { Evaluation, EvaluationSchema } from 'src/core/database/schemas/evaluation.schema';
import { NotificationModule } from '../notification/notification.module';
import { NotificationSchema,Notification } from 'src/core/database/schemas/notifications.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Evaluation.name, schema: EvaluationSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    NotificationModule
  ],
  controllers: [EvaluationController],
  providers: [EvaluationService],
})
export class EvaluationModule {}
