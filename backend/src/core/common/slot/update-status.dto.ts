import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { LoanStatus } from '../enums/status.enum';

export class UpdateSlotStatusDto {

  @ApiProperty({
    enum: LoanStatus,
    example: LoanStatus.EXTEND_REQUESTED,
  })
  @IsEnum(LoanStatus)
  status: LoanStatus;

  // кто инициировал действие
  @IsString()
  userId: string;

  // если продление — можно передать количество дней
  @IsOptional()
  @IsNumber()
  extendDays?: number;
}