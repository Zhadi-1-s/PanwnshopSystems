import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDateString, IsEnum,ValidateNested, IsOptional, Matches } from 'class-validator';
import { LoanStatus, Status } from '../enums/status.enum';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';
import { Product } from 'src/core/database/schemas/product.schema';
import { SlotCloseReason } from '../enums/status.enum';
export class CreateSlotDto {
  @ApiProperty({
    example: '671b2f3c4a12efbd1a23a456',
    description: 'ID продукта, заложенного в ломбард',
  })
  @IsNotEmpty()
  @IsString()
  product: string;

  @ApiProperty({
    example: '671b2f3c4a12efbd1a23b789',
    description: 'ID ломбарда, которому принадлежит слот',
  })
  @IsNotEmpty()
  @IsString()
  pawnshopId: string;

  @ApiProperty({
    example: '671b2f3c4a12efbd1a23c999',
    description: 'ID пользователя, который сдал товар',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    example: 50000,
    description: 'Сумма займа, выданная пользователю',
  })
  @IsNotEmpty()
  @IsNumber()
  loanAmount: number;

  @ApiProperty({
    example: '2025-10-25T00:00:00.000Z',
    description: 'Дата начала займа',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2025-11-25T00:00:00.000Z',
    description: 'Дата окончания займа',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: 0.5,
    description: 'Процентная ставка в день (в %)',
  })
  @IsNotEmpty()
  @IsNumber()
  interestRate: number;

  @ApiProperty({
    example: 'active',
    enum: LoanStatus,
    description: 'Статус слота',
    default: 'active',
  })
  @IsNotEmpty()
  @IsEnum(LoanStatus)
  status: LoanStatus;

 @ApiProperty({
    example: false,
    description: 'Разрешена ли пролонгация',
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  prolongationAllowed?: boolean;

  @ApiProperty({
    example: '+77086757610',
    description: 'Телефонный номер пользователя для связи',})
  @IsOptional()
  @IsString()
  @Matches(/^\+7\d{10}$/, {
    message: 'Телефон должен быть в формате +7XXXXXXXXXX',
  })
  telephone?: string;

  @IsOptional()
  @IsString()
  offerId?: string;

  @IsOptional()
  @IsEnum(SlotCloseReason)
  closeReason?: SlotCloseReason;

}
