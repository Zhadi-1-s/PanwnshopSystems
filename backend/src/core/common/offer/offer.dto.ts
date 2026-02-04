import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsString, isMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString,ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
class LoanDetailsDto {
  @ApiProperty()
  @IsNumber()
  rate: number;

  @ApiProperty({ enum: ['day', 'month'] })
  @IsEnum(['day', 'month'])
  period: 'day' | 'month';

  @ApiProperty()
  @IsNumber()
  loanTerm: number;

  @ApiProperty()
  @IsNumber()
  estimatedRepayment: number;
}

export class CreateOfferDto {
  @ApiProperty()
  @IsMongoId()
  productId: string;

  @ApiProperty()
  @IsMongoId()
  pawnshopId: string;

  @ApiProperty()
  @IsMongoId()
  productOwnerId:string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  // 💰 optional
  @ApiPropertyOptional({ type: LoanDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LoanDetailsDto)
  loanDetails?: LoanDetailsDto;
}
