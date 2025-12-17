import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Offer,OfferDocument } from 'src/core/database/schemas/offer.schema';
import { Model, Types } from 'mongoose';
import { CreateOfferDto } from './offer.dto';
import { UpdateOfferStatusDto } from './update-offer.dto';
import { NotificationService } from '../notification/notification.service';
import { PawnshopService } from '../pawnshop/pawnshop.service';

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name)
    private offerModel: Model<OfferDocument>,
    private notificationService:NotificationService,
    private pawnshopService:PawnshopService
  ) {}

  // Создать оффер
  async create(dto: CreateOfferDto) {
    const offer = await this.offerModel.create(dto);

    const pawnshop = await this.pawnshopService.findOne(dto.pawnshopId);
    const pawnshopName = pawnshop.name;
    
    await this.notificationService.create({
      userId: dto.productOwnerId, // кому отправляем уведомление
      senderId: dto.pawnshopId,
      type: 'new-offer',
      title: 'New offer received',
      message: `${pawnshopName} отправил предложение вашему товару.`,
      refId: offer._id?.toString(),
      isRead:false
    });

    return offer;

  }

  // Получить офферы по productId
  async getOffersByProduct(productId: string) {
    return this.offerModel.find({ productId }).sort({ createdAt: -1 }).exec();
  }

  // Получить офферы конкретного ломбарда
  async getOffersByPawnshop(pawnshopId: string) {
    return this.offerModel.find({ pawnshopId }).sort({ createdAt: -1 }).exec();
  }

  // Получить один оффер
  async getById(id: string) {
    const offer = await this.offerModel.findById(id);
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  // Обновить статус (accept / reject)
  async updateStatus(id: string, dto: UpdateOfferStatusDto) {
    return this.offerModel.findByIdAndUpdate(id, { status: dto.status }, { new: true });
  }
}
