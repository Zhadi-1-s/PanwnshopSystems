import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Offer,OfferDocument } from 'src/core/database/schemas/offer.schema';
import { Model, Types } from 'mongoose';
import { CreateOfferDto } from './offer.dto';
import { NotificationService } from '../notification/notification.service';
import { PawnshopService } from '../pawnshop/pawnshop.service';
import { NotificationDocument ,Notification} from 'src/core/database/schemas/notifications.schema';

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name)
    private offerModel: Model<OfferDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel:Model<NotificationDocument>,
    private notificationService:NotificationService,
    private pawnshopService:PawnshopService
  ) {}

  // Создать оффер
  async create(dto: CreateOfferDto) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 10);

    const offer = await this.offerModel.create({
      ...dto,
      expiresAt
    });

    const pawnshop = await this.pawnshopService.findOne(dto.pawnshopId);
    const pawnshopName = pawnshop.name;
    

    await this.notificationService.create({
      userId: dto.productOwnerId, // кому отправляем уведомление
      senderId: dto.pawnshopId,
      type: 'new-offer',
      title: 'New offer received',
      message: `${pawnshopName} отправил предложение вашему товару.`,
      refId: offer._id?.toString(),
      isRead:false,
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
  async getById(id: string): Promise<Offer> {
    const offer = await this.offerModel.findById(id).exec();
    if (!offer) throw new NotFoundException('Offer not found');

    // Если оффер в статусе in_inspection, проверяем, истекло ли время
    if (offer.status === 'in_inspection') {
      const now = new Date();
      const inspectionDeadline = new Date(offer.updatedAt);
      inspectionDeadline.setHours(inspectionDeadline.getHours() + 24); // 24 часа

      if (now > inspectionDeadline) {
        offer.status = 'no_show'; // Можно добавить статус expired
        await offer.save();
      }
    }

    return offer;
  }

  // Обновить статус (accept / reject)
  async updateStatus(
      offerId: string,
      status: 'pending' | 'completed' | 'rejected' | 'in_inspection' | 'no_show',
  ) {
      const offer = await this.offerModel.findById(offerId);

      if (!offer) throw new NotFoundException('Offer not found');

      // Обновляем статус
      offer.status = status;
      offer.updatedAt = new Date();
      await offer.save();

      // Отправка уведомления (можно делать более точно по статусу)
      await this.notificationService.create({
          userId: offer.pawnshopId.toString(),
          senderId: offer.productOwnerId.toString(),
          type: status === 'pending' ? 'offer-accepted' : 'offer-updated',
          title: `Offer ${status}`,
          refId: offer._id.toString(),
          isRead: false,
      });

      return offer;
  }



}
