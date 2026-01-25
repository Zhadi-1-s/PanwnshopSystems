import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evaluation } from 'src/core/database/schemas/evaluation.schema';
import { CreateEvaluationDto } from './evaluation.dto';
import { UpdateEvaluationStatusDto } from './evaluation.dto';
import { NotificationService } from '../notification/notification.service';
import { send } from 'process';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectModel(Evaluation.name)
    private evaluationModel: Model<Evaluation>,
    private notificationService: NotificationService,
  ) {}

  async create(dto: CreateEvaluationDto): Promise<Evaluation> {
    const duplicate = await this.evaluationModel.findOne({
      userId: dto.userId,
      pawnshopId: dto.pawnshopId,
      title: dto.title,
      expectedPrice: dto.expectedPrice
    });

    if (duplicate) {
      return duplicate;
    }

    const evaluation = await this.evaluationModel.create(dto);

    await this.createEvaluationNotifications(evaluation, dto);

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

  async updateStatus(id: string, dto: UpdateEvaluationStatusDto): Promise<Evaluation> {
    const updated = await this.evaluationModel.findByIdAndUpdate(
      id,
      { status: dto.status },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Evaluation not found');
    return updated;
  }

  private async createEvaluationNotifications(
    evaluation: Evaluation,
    dto: CreateEvaluationDto
  ) {
    const refId = evaluation._id?.toString();

    await this.notificationService.createMany([
      {
        userId: dto.pawnshopId,
        senderId: dto.userId,
        type: 'new-offer',
        title: 'New evaluation request',
        message: `You have a new evaluation request for product ${dto.title} (${dto.expectedPrice})`,
        refId,
        isRead: false
      },
      {
        userId: dto.userId,
        senderId: dto.pawnshopId,
        type: 'evaluation-created',
        title: 'Evaluation sent',
        message: `You sent an evaluation request for ${dto.title}`,
        refId,
        isRead: false
      }
    ]);
  }


}
