import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PawnshopProfile,PawnshopProfileSchema } from 'src/core/database/schemas/shopProfile.schema';
import { PawnshopService } from './pawnshop.service';
import { PawnshopController } from './pawnshop.controller';
import { ProductModule } from '../product/product.module';
import { SlotModule } from '../slot/slot.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PawnshopProfile.name, schema: PawnshopProfileSchema },
    ]),
    ProductModule,
    SlotModule
  ],
  controllers: [PawnshopController],
  providers: [PawnshopService],
  exports: [PawnshopService],
})
export class PawnshopModule {}
