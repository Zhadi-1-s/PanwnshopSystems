import { IsString, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';

export class CreateEvaluationDto {
  @IsString()
  userId: string;

  @IsString()
  userTelephoneNumber: string;

  @IsString()
  pawnshopId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['new', 'good', 'used', 'broken'])
  condition: 'new' | 'good' | 'used' | 'broken';

  @IsArray()
  photos: string[];

  @IsOptional()
  @IsNumber()
  expectedPrice?: number;

  @IsOptional()
  @IsNumber()
  termDays:number

}

export class UpdateEvaluationStatusDto {
  @IsEnum(['pending', 'in_inspection', 'rejected','no_show'])
  status: 'pending' | 'in_inspection' | 'rejected'|'no_show';
}