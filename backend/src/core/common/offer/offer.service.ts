import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Offer,OfferDocument } from 'src/core/database/schemas/offer.schema';
import { Model, Types } from 'mongoose';
import { CreateOfferDto } from './offer.dto';
import { NotificationService } from '../notification/notification.service';
import { PawnshopService } from '../pawnshop/pawnshop.service';
import { NotificationDocument ,Notification} from 'src/core/database/schemas/notifications.schema';
import { ProductService } from '../product/product.service';
import { SlotService } from '../slot/slot.service';
import { Status } from '../enums/status.enum';



@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name)
    private offerModel: Model<OfferDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel:Model<NotificationDocument>,
    private notificationService:NotificationService,
    private pawnshopService:PawnshopService,
    private productService:ProductService,
    private slotService:SlotService,
  ) {}

  // Создать оффер
  async create(dto: CreateOfferDto) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // истекает через 24 часа

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

    if (
      offer.status === 'in_inspection' &&
      offer.expiresAt &&
      new Date() > offer.expiresAt
    ) {
      offer.status = 'no_show';
      await offer.save();
    }

    return offer;
  }


  // Обновить статус (accept / reject)
  async updateStatus(
      offerId: string,
      status: 'pending' | 'completed' | 'rejected' | 'in_inspection' | 'no_show' | 'rejected_by_pawnshop' | 'in_loan'
  ) {
      const offer = await this.offerModel.findById(offerId);

      if (!offer) throw new NotFoundException('Offer not found');

      if (status === 'in_inspection') {
        const inspectionHours = 24; // Количество часов на инспекцию
        offer.expiresAt = new Date(Date.now() + inspectionHours * 60 * 60 * 1000);
      }

      if(status === 'completed'){
        const product = await this.productService.findById(offer.productId.toString())

        if(product.type === 'loan'){

          const startDate = new Date();
          const loanTermDays = product.loanTerm || 0;
          const endDate = new Date(startDate.getTime());
          endDate.setDate(startDate.getDate() + loanTermDays);

          let interestRate = offer.loanDetails?.rate || 0;

          if (offer.loanDetails?.period === 'month') {
            interestRate = interestRate / 30;
          }

          await this.slotService.createSlot({
            product: offer.productId.toString(),
            pawnshopId: offer.pawnshopId.toString(),
            userId: offer.productOwnerId.toString(),
            loanAmount: offer.price,
            startDate,
            endDate,
            interestRate,
            status:Status.ACTIVE
          });

          offer.status = 'in_loan';
          await this.notificationService.create({
            userId: offer.productOwnerId.toString(),
            senderId: offer.pawnshopId.toString(),
            type: 'offer-in-loan',  // <-- новый тип уведомления
            title: 'Loan started',
            message: `Your loan for product "${product.title}" has started.`,
            refId: offer._id.toString(),
            isRead: false,
            // data: { productId: product._id.toString(), slotId: slot._id.toString() }
          });
        }
        else{
          offer.status = 'completed';
        }

      }

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

  async cancelOffer(offerId:string,reason:string){
    const offer = await this.offerModel.findById(offerId);

    if (!offer) throw new NotFoundException('Offer not found');

    if(offer.status !== 'in_inspection'){
      throw new NotFoundException('Only in_inspection offers can be cancelled');
    }

    offer.status = 'rejected_by_pawnshop';
    offer.cancelReason = reason;
    offer.updatedAt = new Date();

    await offer.save();

    await this.notificationService.create({
      userId:offer.productOwnerId.toString(),
      senderId:offer.pawnshopId.toString(),
      type:'offer-cancelled',
      title:'Offer cancelled by pawnshop',
      message:reason,
      refId:offer._id.toString(),
      isRead:false
    })

  }

}
