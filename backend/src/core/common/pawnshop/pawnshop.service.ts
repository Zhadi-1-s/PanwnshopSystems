import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PawnshopProfile } from 'src/core/database/schemas/shopProfile.schema';
import { CreatePawnshopDto,UpdatePawnshopDto } from './pawnshop.dto';
import { Review } from 'src/core/database/schemas/reviews.schema';

@Injectable()
export class PawnshopService {
  constructor(
    @InjectModel(PawnshopProfile.name)
    private pawnshopModel: Model<PawnshopProfile>,
  ) {}


  async create(createDto: CreatePawnshopDto): Promise<PawnshopProfile> {
    const defaultRating = 5.0;
    const defaultLogo = 'assets/png/pawnshopLogo.jpg';
    const defaultPhotos = ['assets/img/home-page1.jpg', 'assets/img/home.jpg'];

    const pawnShopData = { 
      ...createDto,
      rating:defaultRating,
      terms: createDto.terms
    }

    const pawnshop = new this.pawnshopModel(pawnShopData);
    console.log('Saving pawnshop:', pawnShopData);
    return pawnshop.save();
  }

  async findAll(): Promise<PawnshopProfile[]> {
    return this.pawnshopModel.find().populate('userId', '-password').exec();
  }

  async findOne(id: string): Promise<PawnshopProfile> {
    const pawnshop = await this.pawnshopModel.findById(id).populate('userId', '-password').exec();
    if (!pawnshop) {
      throw new NotFoundException(`Pawnshop with id ${id} not found`);
    }
    return pawnshop;
  }

  async findByUserId(userId: string): Promise<PawnshopProfile | null> {
    return this.pawnshopModel.findOne({ userId }).exec();
  }

  async update(id: string, updateDto: UpdatePawnshopDto): Promise<PawnshopProfile> {
    const pawnshop = await this.pawnshopModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!pawnshop) {
      throw new NotFoundException(`Pawnshop with id ${id} not found`);
    }
    return pawnshop;
  }
  
  async remove(id: string): Promise<void> {
    const result = await this.pawnshopModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Pawnshop with id ${id} not found`);
    }
  }

  async addReview(pawnshopId: string, reviewDto: { userId: string; userName?: string; rating: number; comment?: string }): Promise<PawnshopProfile> {
    const pawnshop = await this.pawnshopModel.findById(pawnshopId);
    if (!pawnshop) throw new NotFoundException(`Pawnshop with id ${pawnshopId} not found`);

    const existing = pawnshop.reviews.find(r => r.userId.toString() === reviewDto.userId);
    if (existing) {
      throw new BadRequestException('User has already reviewed this pawnshop');
    }

    // Конвертация userId в ObjectId
    const review: Review = {
      ...reviewDto,
      userId: new Types.ObjectId(reviewDto.userId),
      createdAt: new Date(),
    };

    // Добавляем в массив reviews
    pawnshop.reviews.push(review);

    // Пересчёт рейтинга
    const total = pawnshop.reviews.reduce((sum, r) => sum + r.rating, 0);
    pawnshop.rating = total / pawnshop.reviews.length;

    await pawnshop.save();

    return pawnshop;
  }

}
