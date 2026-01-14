import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateOfferStatusDto {
  @ApiProperty({ enum: ['pending', 'completed', 'rejected','in_inspection', 'no_show'] })
  @IsEnum(['pending', 'completed', 'rejected','in_inspection', 'no_show'])
  status: 'pending' | 'completed' | 'rejected' | 'in_inspection' | 'no_show';
}
