import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './offer.dto';
import { UpdateOfferStatusDto } from './update-offer.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('offers')
@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  create(@Body() dto: CreateOfferDto) {
    return this.offerService.create(dto);
  }

  @Get('product/:id')
  getByProduct(@Param('id') productId: string) {
    return this.offerService.getOffersByProduct(productId);
  }

  @Get('pawnshop/:id')
  getByPawnshop(@Param('id') pawnshopId: string) {
    return this.offerService.getOffersByPawnshop(pawnshopId);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.offerService.getById(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() status: 'pending' | 'accepted' | 'rejected') {
    return this.offerService.updateStatus(id, status);
  }
}
