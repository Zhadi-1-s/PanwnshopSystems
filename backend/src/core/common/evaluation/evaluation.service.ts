import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evaluation } from 'src/core/database/schemas/evaluation.schema';
import { CreateEvaluationDto } from './evaluation.dto';
import { UpdateEvaluationStatusDto } from './evaluation.dto';
import { NotificationService } from '../notification/notification.service';
import { send } from 'process';
import { EvaluationDocument } from 'src/core/database/schemas/evaluation.schema';
import { Cron,CronExpression } from '@nestjs/schedule';
import { NotificationDocument, NotificationType } from 'src/core/database/schemas/notifications.schema';
import { Notification } from 'src/core/database/schemas/notifications.schema';
import { SlotService } from '../slot/slot.service';
import { ProductService } from '../product/product.service';
import { Category } from '../enums/category.enum';
import { ProductType } from '../enums/produtc.type.enum';
import { LoanStatus, ProductStatus } from '../enums/status.enum';
import { PawnshopProfile } from 'src/core/database/schemas/shopProfile.schema';
import { ProductDocument } from 'src/core/database/schemas/product.schema';
@Injectable()
  export class EvaluationService {
    constructor(
      @InjectModel(Evaluation.name)
      private evaluationModel: Model<EvaluationDocument>,
      private notificationService: NotificationService,
      @InjectModel(Notification.name)
      private notificationModel: Model<NotificationDocument>,

      private slotService: SlotService,
      private productService: ProductService,

      @InjectModel(PawnshopProfile.name)
      private pawnshopModel: Model<PawnshopProfile>
    ) {}

  async create(dto: CreateEvaluationDto): Promise<Evaluation> {
    const duplicate = await this.evaluationModel.findOne({
      userId: dto.userId,
      pawnshopId: dto.pawnshopId,
      title: dto.title,
      expectedPrice: dto.expectedPrice,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) 
    });

    if (duplicate) {
      return duplicate;
    }

    const evaluation = await this.evaluationModel.create(dto);

    await this.createEvaluationNotification('pending', evaluation);

    return evaluation;
  }

  async getByPawnshop(pawnshopId: string): Promise<Evaluation[]> {
    return this.evaluationModel.find({ pawnshopId }).sort({ createdAt: -1 });
  }

  async getByUser(userId: string): Promise<Evaluation[]> {
    return this.evaluationModel.find({ userId }).sort({ createdAt: -1 });
  }

  async getById(id: string): Promise<Evaluation> {
    const evalFound = await this.evaluationModel.findById(id);
    if (!evalFound) throw new NotFoundException('Evaluation not found');
    return evalFound;
  }

 y

  private async createEvaluationNotification(
    status: 'pending' | 'in_inspection' | 'rejected' | 'no_show' | 'completed' | 'expired' | 'canceled',
    evaluation: Evaluation
  ) {
    const messages: Record<
      typeof status,
      { type: NotificationType; title: string; message: string; senderId: string }
    > = {
      pending: {
        type: 'evaluation-created',
        title: 'New evaluation request',
        message: `New evaluation request for ${evaluation.title}`,
        senderId: evaluation.pawnshopId
      },
      in_inspection: {
        type: 'evaluation-accepted',
        title: 'Evaluation accepted',
        message: `Pawnshop agreed to inspect ${evaluation.title}`,
        senderId: evaluation.pawnshopId
      },
      rejected: {
        type: 'evaluation-updated',
        title: 'Evaluation rejected',
        message: `Pawnshop rejected ${evaluation.title}`,
        senderId: evaluation.pawnshopId
      },
      no_show: {
        type: 'evaluation-updated',
        title: 'Inspection cancelled',
        message: `Inspection cancelled because you did not arrive`,
        senderId: evaluation.pawnshopId
      },
      completed: {
        type: 'evaluation-updated',
        title: 'Deal completed',
        message: `Deal for ${evaluation.title} has been completed`,
        senderId: evaluation.pawnshopId
      },
      expired: {
        type: 'evaluation-updated',
        title: 'Evaluation expired',
        message: `Evaluation expired for ${evaluation.title}`,
        senderId: evaluation.pawnshopId
      },
      canceled:{
        type:'evaluation-updated',
        title:'Evaluation canceled',
        message:`Evaluation canceled for ${evaluation.title}`,
        senderId: evaluation.pawnshopId
      }
    };

    const data = messages[status];

    await this.upsertEvaluationNotification({
      userId: evaluation.userId,
      senderId: data.senderId,
      type: data.type,
      title: data.title,
      message: data.message,
      refId: (evaluation._id as any).toString()
    });
  }

  async upsertEvaluationNotification(data: {
    userId: string;
    senderId: string;
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
          isRead: false,
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
  async handleExpiredEvaluations() {
    const now = new Date();

    const expired = await this.evaluationModel.find({
      status: { $in: ['in_inspection', 'pending'] },
      expiresAt: { $lte: now }
    });

    for (const evaluation of expired) {

      if (evaluation.status === 'in_inspection') {
        evaluation.status = 'no_show';
      }

      if (evaluation.status === 'pending') {
        evaluation.status = 'expired';
      }

      evaluation.updatedAt = new Date();
      await evaluation.save();

      await this.createEvaluationNotification(
        evaluation.status as any,
        evaluation
      );
    }
  }

}
