import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Slot,SlotSchema } from 'src/core/database/schemas/slot.schema';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';
import { from } from 'rxjs';

@Module({
  imports: [MongooseModule.forFeature([{ name: Slot.name, schema: SlotSchema }])],
  providers: [SlotService],
  controllers: [SlotController],
  exports: [SlotService],
})
export class SlotModule {}
