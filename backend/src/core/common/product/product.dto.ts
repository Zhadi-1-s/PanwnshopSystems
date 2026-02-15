import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, IsMongoId, isString, IsNumber,ValidateNested, Min,ValidateIf } from 'class-validator';
import { Category } from '../enums/category.enum';
import { ProductStatus, Status } from '../enums/status.enum';
import { Type } from 'class-transformer';
import { ProductType } from '../enums/produtc.type.enum';

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

  @ApiProperty({enum:ProductStatus,default:ProductStatus.ACTIVE})
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({example:'1000 тг',required:true})
  @IsNumber()
  price:number;

  @IsEnum(ProductType)
  @ApiProperty({
    enum: ProductType,
    default: ProductType.SALE,
  })
  type: ProductType;

  @ApiProperty({
    example: 30,
    required: false,
    description: 'Срок займа (обязателен если type = loan)'
  })
  @ValidateIf(o => o.type === ProductType.LOAN)
  @IsNumber()
  @Min(1)
  loanTerm?: number;
}
