import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evaluation } from 'src/core/database/schemas/evaluation.schema';
import { CreateEvaluationDto } from './evaluation.dto';
import { UpdateEvaluationStatusDto } from './evaluation.dto';
import { NotificationService } from '../notification/notification.service';
import { send } from 'process';
import { EvaluationDocument } from 'src/core/database/schemas/evaluation.schema';
import { Cron,CronExpression } from '@nestjs/schedule';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectModel(Evaluation.name)
    private evaluationModel: Model<EvaluationDocument>,
    private notificationService: NotificationService,
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

 async updateStatus(
  id: string,
  dto: UpdateEvaluationStatusDto
): Promise<Evaluation> {

  const evaluation = await this.evaluationModel.findById(id);
  if (!evaluation) throw new NotFoundException('Evaluation not found');

  if (dto.status === 'in_inspection') {
    evaluation.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
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

  await this.createEvaluationNotification(dto.status, evaluation);

  return evaluation;
}

 private async createEvaluationNotification(
  status: 'pending' | 'in_inspection' | 'rejected' | 'no_show' | 'completed' | 'expired',
  evaluation: Evaluation
) {

  const messages = {
    pending: {
      type: 'evaluation-created',
      title: 'New evaluation request',
      message: `New evaluation request for ${evaluation.title}`,
      userId: evaluation.pawnshopId,
      senderId: evaluation.userId
    },

    in_inspection: {
      type: 'evaluation-accepted',
      title: 'Evaluation accepted',
      message: `Pawnshop agreed to inspect ${evaluation.title}`,
      userId: evaluation.userId,
      senderId: evaluation.pawnshopId
    },

    rejected: {
      type: 'evaluation-updated',
      title: 'Evaluation rejected',
      message: `Pawnshop rejected ${evaluation.title}`,
      userId: evaluation.userId,
      senderId: evaluation.pawnshopId
    },

    no_show: {
      type: 'evaluation-updated',
      title: 'Inspection cancelled',
      message: `Inspection cancelled because you did not arrive`,
      userId: evaluation.userId,
      senderId: evaluation.pawnshopId
    },

    completed: {
      type: 'evaluation-updated',
      title: 'Deal completed',
      message: `Deal for ${evaluation.title} has been completed`,
      userId: evaluation.userId,
      senderId: evaluation.pawnshopId
    }
  };

  const data = messages[status];

  await this.notificationService.create({
    userId: data.userId,
    senderId: data.senderId,
    type: data.type,
    title: data.title,
    message: data.message,
    refId: (evaluation._id as string).toString(),
    isRead: false,
    data: {
      evaluationId: evaluation._id,
      status
    }
  })
    await this.notificationService.create({
    userId: evaluation.userId,   // теперь для пользователя
    senderId: evaluation.userId, // кто создал
    type: 'evaluation-created',
    title: `Your evaluation request for ${evaluation.title}`,
    message: `You sent a new evaluation request`,
    refId: (evaluation._id as string).toString(),
    isRead: true, // можно сразу отметить как прочитанное для себя
    data: { evaluationId: evaluation._id, status: 'pending' }
  });;
}

  @Cron(CronExpression.EVERY_HOUR)
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
