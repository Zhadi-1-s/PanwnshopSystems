import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Slot,SlotSchema } from 'src/core/database/schemas/slot.schema';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';
import { from } from 'rxjs';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Slot.name, schema: SlotSchema }]),NotificationModule],
  providers: [SlotService],
  controllers: [SlotController],
  exports: [SlotService],
})
export class SlotModule {}
