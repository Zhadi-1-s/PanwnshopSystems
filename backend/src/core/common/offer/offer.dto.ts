import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsString, isMongoId } from 'class-validator';

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
}
