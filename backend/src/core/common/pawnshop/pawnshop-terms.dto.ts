import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ArrayUnique,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PawnshopTermsDto {
  @ApiProperty({ example: 3.5, description: 'Процентная ставка в день или месяц' })
  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @ApiProperty({ example: 7, description: 'Минимальный срок займа в днях' })
  @IsOptional()
  @IsNumber()
  minTermDays?: number;

  @ApiProperty({ example: 500000, description: 'Максимальная сумма займа' })
  @IsOptional()
  @IsNumber()
  maxAmount?: number;

  @ApiProperty({ example: 2.5, description: 'Комиссия в процентах' })
  @IsOptional()
  @IsNumber()
  fees?: number;

  @ApiProperty({ example: 'Залог должен быть в хорошем состоянии', description: 'Дополнительные условия' })
  @IsOptional()
  @IsString()
  additional?: string;
}
