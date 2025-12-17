import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateOfferStatusDto {
  @ApiProperty({ enum: ['pending', 'accepted', 'rejected'] })
  @IsEnum(['pending', 'accepted', 'rejected'])
  status: 'pending' | 'accepted' | 'rejected';
}
