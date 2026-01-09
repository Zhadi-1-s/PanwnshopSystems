import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, IsMongoId, isString, IsNumber,ValidateNested } from 'class-validator';
import { Category } from '../enums/category.enum';
import { Status } from '../enums/status.enum';
import { Type } from 'class-transformer';

class ProductPhotoDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  @IsString()
  url: string;

  @ApiProperty({ example: 'products/iphone_123abc' })
  @IsString()
  publicId: string;
}

export class CreateProductDto {
  @ApiProperty({ example: '6707f9a3c52f1a2b6b2f1d1c', description: 'ID владельца (User._id) или (PawnShopId)' })
  @IsMongoId()
  ownerId: string;

  @ApiProperty({ example: 'iPhone 13 Pro', description: 'Название продукта' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Телефон в хорошем состоянии', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Electronics', description: 'Категория товара' })
  @IsEnum(Category)
  category: Category;

  @ApiProperty({
    type: [ProductPhotoDto],
    required: false,
    description: 'Фото товара'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPhotoDto)
  photos?: ProductPhotoDto[];

  @ApiProperty({enum:Status,default:Status.ACTIVE})
  @IsOptional()
  status?: Status;

  @ApiProperty({example:'1000 тг',required:true})
  @IsNumber()
  price:number;
}
