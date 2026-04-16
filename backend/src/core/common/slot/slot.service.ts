import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Slot,SlotDocument } from 'src/core/database/schemas/slot.schema';
import { CreateSlotDto } from './create-slot.dto';
import { NotificationService } from '../notification/notification.service';

import { Cron, CronExpression } from '@nestjs/schedule';
import { LoanStatus, SlotCloseReason } from '../enums/status.enum';
import { UpdateSlotStatusDto } from './update-status.dto';
import { NotificationType } from 'src/core/database/schemas/notifications.schema';
import { NotificationDocument,Notification } from 'src/core/database/schemas/notifications.schema';

@Injectable()
export class SlotService {
  constructor(
    @InjectModel(Slot.name) private readonly slotModel: Model<SlotDocument>,
    private notificationService:NotificationService,
    @InjectModel(Notification.name)
    private readonly notificationModel:Model<NotificationDocument>,
  ) {}

  async createSlot(dto: CreateSlotDto): Promise<Slot> {
    const newSlot = new this.slotModel({
      ...dto,
      status: dto.status ?? 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const slot = await newSlot.save();

    await this.notificationService.create({
      userId: dto.userId,
      senderId: dto.pawnshopId,
      type: 'slot-created',
      title: 'Loan created',
      message: 'Ваш займ успешно оформлен.',
      refId: slot._id?.toString(),
      readBy: [],
    });

    return slot;
  }

//   async closeSlot(id: string): Promise<Slot> {
//     const slot = await this.slotModel.findById(id);
//     if (!slot) {
//       throw new NotFoundException('Slot not found');
//     }

//     if (slot.status !== 'active') {
//       throw new BadRequestException('Slot is already closed or expired');
//     }

//     slot.status = 'closed';
//     slot.updatedAt = new Date();
//     return slot.save();
//   }

  async deleteSlot(id: string): Promise<{ message: string }> {
    const result = await this.slotModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Slot not found');
    }
    return { message: 'Slot successfully deleted' };
  }

  async getActiveSlots(): Promise<Slot[]> {
    return this.slotModel.find({ status: 'active' }).exec();
  }

  // Получить все слоты
  async findAll(): Promise<Slot[]> {
    return this.slotModel
      .find()
      .populate('product', 'title price')
      .populate('pawnshopId', 'name address')
      .populate('userId', 'username email')
      .exec();
  }

  // Получить слоты по ID пользователя
  async findByUserId(userId: string): Promise<Slot[]> {
    if (!Types.ObjectId.isValid(userId)) throw new NotFoundException('Invalid user ID');
    return this.slotModel
      .find({ userId })
      .populate('product', 'title price')
      .populate('pawnshopId', 'name')
      .exec();
  }

  // Получить слоты по ID ломбарда
  async findByPawnshopId(pawnshopId: string): Promise<Slot[]> {
    if (!Types.ObjectId.isValid(pawnshopId)) throw new NotFoundException('Invalid pawnshop ID');
    return this.slotModel
      .find({ pawnshopId })
  }

  // Получить слот по его ID
  async findById(id: string): Promise<Slot> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid slot ID');
    }

    const slot = await this.slotModel.findById(id).exec();

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    return slot;
  }

  // private async updateIfExpired(slot: SlotDocument) {
  //   if (slot.status === 'active' && slot.endDate < new Date()) {
  //     slot.status = 'expired'; // или closed
  //     await slot.save();
  //   }
  // }

  async updateStatus(id: string, dto:UpdateSlotStatusDto): Promise<Slot> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid slot ID');
    }

    const slot = await this.slotModel.findById(id);
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    // если статус уже такой же — просто возвращаем
    if (slot.status === dto.status) {
      return slot;
    }

    slot.status = dto.status;
    slot.updatedAt = new Date();

    await slot.save();

    // if (dto.status === LoanStatus.EXTEND_REQUESTED) {
    //   await this.notificationService.create({
    //     userId: slot.pawnshopId.toString(),
    //     senderId: dto.userId,
    //     type: 'extend-request',
    //     title: 'Extension request',
    //     message: 'Пользователь запросил продление займа',
    //     refId: slot._id.toString(),
    //     readBy: [],
    //     data: { slotId: slot._id.toString() }
    //   });
    // }
    // if(dto.status === LoanStatus.ACTIVE){
    //   const now = new Date();
    //   const currentEnd = new Date(slot.endDate);

    //   // если срок ещё не истёк — продлеваем от текущего endDate
    //   // если уже истёк — продлеваем от сегодняшнего дня
    //   const baseDate = currentEnd > now ? currentEnd : now;

    //   baseDate.setDate(baseDate.getDate() + 7); // только 1 неделя
    //   slot.endDate = baseDate;

    //   await slot.save();

    //   await this.notificationService.create({
    //     userId: slot.userId.toString(),
    //     senderId: dto.userId,
    //     type: 'extend-approved',
    //     title: 'Extension approved',
    //     message: 'Продление займа одобрено',
    //     refId: slot._id.toString(),
    //     readBy: [],
    //     data: { slotData:slot }
    //   });
    // }

    if(dto.status === LoanStatus.COMPLETED){

      await this.upsertSlotNotification({
        userId:slot.userId.toString(),
        senderId:dto.userId,
        type:'slot-completed',
        title:'Loan completed',
        message:'Ваш займ завершён. Спасибо, что воспользовались нашими услугами!',
        refId: slot._id.toString(),
        
      })
    }

    return slot;
  }

  async closeSlot(
    id: string,
    status: LoanStatus,
    closeReason: SlotCloseReason,
    userId: string
  ) {
    const slot = await this.slotModel.findById(id);
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    // 👇 формируем сообщение
    let message = '';

    switch (closeReason) {
      case SlotCloseReason.NON_PAYMENT:
        message = 'Займ закрыт из-за неуплаты';
        break;
      case SlotCloseReason.MANUAL:
        message = 'Займ закрыт вручную';
        break;
      case SlotCloseReason.EARLY_REPAYMENT:
        message = 'Займ погашен досрочно';
        break;
      case SlotCloseReason.ADMIN_FORCE:
        message = 'Займ принудительно закрыт администратором';
        break;
      default:
        message = 'Займ закрыт';
    }

    // 👇 обновляем уведомление
    await this.upsertSlotNotification({
      userId: slot.userId.toString(), // важно — не тот кто закрыл, а владелец слота
      senderId: userId,
      type: 'slot-closed',
      title: 'Loan closed',
      message,
      refId: slot._id.toString(),
    });

    return this.slotModel.findByIdAndUpdate(
      id,
      {
        status,
        closeReason,
        closedAt: new Date(),
        closedBy: userId,
      },
      { new: true }
    );
  }

  async upsertSlotNotification(data: {
        userId: string;
        senderId?: string;
        type: NotificationType;
        title: string;
        message: string;
        refId: string;
      }) {
        return this.notificationModel.findOneAndUpdate(
          {
            userId: data.userId,
            refId: data.refId, // ищем уведомление на этот объект
          },
          {
            $set: {
              senderId: data.senderId,
              type: data.type,     // обновляем текущий статус
              title: data.title,
              message: data.message,
              readBy: [], // сбрасываем прочтения при обновлении статуса
              updatedAt: new Date(),
            }
          },
          {
            upsert: true,
            new: true
          }
        );
      }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleExpiredSlots() {
    const now = new Date();

    const res = await this.slotModel.updateMany(
      {
        status: 'active',
        endDate: { $lt: now }
      },
      {
        status: LoanStatus.EXPIRED // или closed если решил так
      }
    );

    console.log('Expired slots checked');
    console.log('Modified:', res.modifiedCount);
    console.log('NOW:', new Date());
  }

}
