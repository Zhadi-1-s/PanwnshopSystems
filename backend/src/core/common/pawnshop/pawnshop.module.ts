import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PawnshopProfile,PawnshopProfileSchema } from 'src/core/database/schemas/shopProfile.schema';
import { PawnshopService } from './pawnshop.service';
import { PawnshopController } from './pawnshop.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PawnshopProfile.name, schema: PawnshopProfileSchema },
    ]),
  ],
  controllers: [PawnshopController],
  providers: [PawnshopService],
  exports: [PawnshopService],
})
export class PawnshopModule {}
