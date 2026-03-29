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

const ONE_DAY = 24 * 60 * 60 * 1000;
const THREE_DAYS = 3 * ONE_DAY;


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
      
    });

    if (duplicate) {
      return duplicate;
    }

    const evaluation = await this.evaluationModel.create({
      ...dto,
      status: 'pending',
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });
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

 async updateStatus(
    id: string,
    dto: UpdateEvaluationStatusDto
    ): Promise<Evaluation> {

      const evaluation = await this.evaluationModel.findById(id);
      if (!evaluation) throw new NotFoundException('Evaluation not found');

      if (dto.status === 'in_inspection') {
        evaluation.expiresAt = new Date(Date.now() + ONE_DAY);
      }

      evaluation.status = dto.status;
      evaluation.updatedAt = new Date();

      await evaluation.save();

      let type: 'evaluation-accepted' | 'evaluation-updated';

      if (dto.status === 'in_inspection') {
        type = 'evaluation-accepted';
      } else {
        type = 'evaluation-updated';
      }

      if(dto.status === 'completed'){

        const pawnshop = await this.pawnshopModel.findById(evaluation.pawnshopId)

        if (!pawnshop) {
          throw new NotFoundException('Pawnshop not found');
        }

        
        const terms = pawnshop.terms;
        
        const amount = dto.approvedAmount ?? 0;

        if (amount > terms.limits.maxAmount) {
          throw new BadRequestException('Amount exceeds pawnshop limit');
        }
        const product:ProductDocument = await this.productService.create({
          ownerId: evaluation.userId,
          ownerType:'user',
          title: evaluation.title,
          description: evaluation.description,
          category:Category.OTHER,
          photos: evaluation.photos,
          price: evaluation.expectedPrice ?? 0,
          type:ProductType.LOAN,
          loanTerm:evaluation.termDays,
          status:ProductStatus.IN_LOAN,
          activatedAt: new Date()
        })

        await this.slotService.createSlot({
          product:(product._id as any).toString(),
          pawnshopId: evaluation.pawnshopId,
          userId: evaluation.userId,
          loanAmount: evaluation.expectedPrice ?? 0,
          startDate: new Date(),
          endDate: new Date(Date.now() + (evaluation.termDays || 0) * 24 * 60 * 60 * 1000),
          interestRate: terms?.interest?.rate ?? 0,
          status:LoanStatus.ACTIVE
        })
      }
      
    await this.upsertEvaluationNotification({
      userId: evaluation.userId,
      senderId: evaluation.pawnshopId,
      type: dto.status === 'in_inspection' ? 'evaluation-accepted' : 'evaluation-updated',
      title: dto.status === 'in_inspection' ? 'Evaluation accepted' : 'Evaluation updated',
      message:
        dto.status === 'in_inspection'
          ? `Pawnshop agreed to inspect ${evaluation.title}`
          : `Status updated for ${evaluation.title}`,
      refId: (evaluation._id as any).toString()
    });

    return evaluation;
  }

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
        senderId: evaluation.userId
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

    await Promise.all([
      this.upsertEvaluationNotification({
        userId: evaluation.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        refId: (evaluation._id as any).toString()
      }),
      this.upsertEvaluationNotification({
        userId: evaluation.pawnshopId,
        type: data.type,
        title: data.title,
        message: data.message,
        refId: (evaluation._id as any).toString()
      })
    ]);
  }

  async upsertEvaluationNotification(data: {
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
