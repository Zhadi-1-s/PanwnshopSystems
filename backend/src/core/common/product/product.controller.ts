import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './product.dto';
import { UpdateProductDto } from './update-product.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Product } from 'src/core/database/schemas/product.schema';
@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый продукт' })
  @ApiResponse({ status: 201, description: 'Продукт успешно создан' })
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех продуктов' })
  @ApiResponse({ status: 200, description: 'Список продуктов', type: [Product] })
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить продукт по ID' })
  @ApiResponse({ status: 200, description: 'Данные продукта' })
  findOne(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить продукт по ID' })
  @ApiResponse({ status: 200, description: 'Продукт успешно обновлён' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить продукт по ID' })
  @ApiResponse({ status: 204, description: 'Продукт удалён' })
  delete(@Param('id') id: string) {
    return this.productService.delete(id);
  }

  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Получить все продукты конкретного пользователя' })
  @ApiResponse({ status: 200, description: 'Список продуктов пользователя' })
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.productService.findByOwner(ownerId);
  }
}
