import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateOfferStatusDto {
  @ApiProperty({ enum: ['pending', 'completed', 'rejected','in_inspection', 'no_show', 'rejected_by_pawnshop'] })
  @IsEnum(['pending', 'completed', 'rejected','in_inspection', 'no_show', 'rejected_by_pawnshop'])
  status: 'pending' | 'completed' | 'rejected' | 'in_inspection' | 'no_show' | 'rejected_by_pawnshop';
}
