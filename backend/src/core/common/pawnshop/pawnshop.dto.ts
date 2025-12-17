import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, ArrayUnique,IsMongoId,ValidateNested } from 'class-validator';
import { PawnshopTermsDto } from './pawnshop-terms.dto';
import { Type } from 'class-transformer';

export class CreatePawnshopDto {

  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({example:'ExtraLombard'})
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({example:'Tole bi 59'})
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({example:'8 777 644 2004'})
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({example: 'assets/img/logo.png'})
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({example:'9:00'})
  @IsOptional()
  @IsString()
  openTime?: string;

  @ApiProperty({example:'19:00'})
  @IsOptional()
  @IsString()
  closeTime?: string;

  @ApiProperty({example:'[Monda,Tue,Wed,Thu,Fri]'})
  @IsOptional()
  @IsArray()
  workingDays?: string[];

  @ApiProperty({example:'4.8'})
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({example:'Good shop with many devices'})
  @IsOptional()
  @IsString()
  description?: string;


  @ApiProperty({example:'[src/img/photo1, photo2]'})
  @IsOptional()
  @IsArray()
  photos?: string[];

  @ApiProperty({
    example: ['66fb0aa2a50a9d75bc3d33f2', '66fb0aa2a50a9d75bc3d33f3'],
    required: false,
    description: 'IDs of active slots (references to Slot documents)',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  activeSlots?: string[];

  @ApiProperty({
    example: 10,
    description: 'Maximum number of active slots allowed for the pawnshop',
  })
  @IsNotEmpty()
  @IsNumber()
  slotLimit: number;

  @ApiProperty({ type: PawnshopTermsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PawnshopTermsDto)
  terms?: PawnshopTermsDto;

}

export class UpdatePawnshopDto extends CreatePawnshopDto {}
