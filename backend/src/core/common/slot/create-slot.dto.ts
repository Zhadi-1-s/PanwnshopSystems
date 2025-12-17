import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDateString, IsEnum,ValidateNested } from 'class-validator';
import { Status } from '../enums/status.enum';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';
import { Product } from 'src/core/database/schemas/product.schema';
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
  startDate: Date;

  @ApiProperty({
    example: '2025-11-25T00:00:00.000Z',
    description: 'Дата окончания займа',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @ApiProperty({
    example: 0.5,
    description: 'Процентная ставка в день (в %)',
  })
  @IsNotEmpty()
  @IsNumber()
  interestRate: number;

  @ApiProperty({
    example: 'active',
    enum: ['active', 'closed', 'expired'],
    description: 'Статус слота',
    default: 'active',
  })
  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;
}
