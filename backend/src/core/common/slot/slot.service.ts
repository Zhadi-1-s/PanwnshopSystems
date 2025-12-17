import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Slot,SlotDocument } from 'src/core/database/schemas/slot.schema';
import { CreateSlotDto } from './create-slot.dto';

@Injectable()
export class SlotService {
  constructor(
    @InjectModel(Slot.name) private readonly slotModel: Model<SlotDocument>,
  ) {}

  async createSlot(dto: CreateSlotDto): Promise<Slot> {
    const newSlot = new this.slotModel({
      ...dto,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return newSlot.save();
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
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid slot ID');
    const slot = await this.slotModel
      .findById(id)
      .populate('product', 'title price')
      .populate('pawnshopId', 'name')
      .populate('userId', 'username')
      .exec();
    if (!slot) throw new NotFoundException('Slot not found');
    return slot;
  }
}
