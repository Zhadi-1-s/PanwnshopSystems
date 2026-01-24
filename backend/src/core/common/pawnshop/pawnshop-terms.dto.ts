import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/* ---------- Interest ---------- */
export class PawnshopInterestDto {
  @ApiProperty({ example: 3.5 })
  @IsNumber()
  rate: number;

  @ApiProperty({ example: 'month', enum: ['day', 'month'] })
  @IsIn(['day', 'month'])
  period: 'day' | 'month';

  @ApiProperty({ example: 0 })
  @IsNumber()
  startsAfterDays: number;

  @ApiProperty({ example: 7, required: false })
  @IsOptional()
  @IsNumber()
  minChargeDays?: number;
}

/* ---------- Limits ---------- */
export class PawnshopLimitsDto {
  @ApiProperty({ example: 500000 })
  @IsNumber()
  maxAmount: number;

  @ApiProperty({ example: 10000, required: false })
  @IsOptional()
  @IsNumber()
  minAmount?: number;
}

/* ---------- Fees ---------- */
export class PawnshopFeesDto {
  @ApiProperty({ example: 'percent', enum: ['fixed', 'percent'] })
  @IsIn(['fixed', 'percent'])
  type: 'fixed' | 'percent';

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  value: number;
}

/* ---------- Main DTO ---------- */
export class PawnshopTermsDto {
  @ApiProperty({ type: PawnshopInterestDto })
  @ValidateNested()
  @Type(() => PawnshopInterestDto)
  interest: PawnshopInterestDto;

  @ApiProperty({ type: PawnshopLimitsDto })
  @ValidateNested()
  @Type(() => PawnshopLimitsDto)
  limits: PawnshopLimitsDto;

  @ApiProperty({ type: PawnshopFeesDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PawnshopFeesDto)
  fees?: PawnshopFeesDto;

  @ApiProperty({ example: 10 })
  @IsNumber()
  priceAdjustmentLimitPercent: number;
}
