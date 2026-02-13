import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PawnshopProfile } from 'src/core/database/schemas/shopProfile.schema';
import { CreatePawnshopDto,UpdatePawnshopDto } from './pawnshop.dto';
import { Review } from 'src/core/database/schemas/reviews.schema';

import { CITIES } from 'src/core/database/cities.constants';
import { Slot } from 'src/core/database/schemas/slot.schema';
import { Product } from 'src/core/database/schemas/product.schema';

@Injectable()
export class PawnshopService {
  constructor(
    @InjectModel(PawnshopProfile.name)
    private pawnshopModel: Model<PawnshopProfile>,

    @InjectModel(Slot.name)
    private slotModel: Model<Slot>,

    @InjectModel(Product.name)
    private productModel: Model<Product>,
  ) {}


  async create(createDto: CreatePawnshopDto): Promise<PawnshopProfile> {
    const defaultRating = 5.0;
    const defaultLogo = 'assets/png/pawnshopLogo.jpg';
    const defaultPhotos = ['assets/img/home-page1.jpg', 'assets/img/home.jpg'];

    const pawnShopData = { 
      ...createDto,
      city:{
        code:createDto.cityCode,
        name:CITIES.find(c=>c.code===createDto.cityCode)?.name
      },
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


  async calculateSummary(pawnshopId: string) {
    const pawnshop = await this.pawnshopModel.findById(pawnshopId).lean();
    if (!pawnshop) {
      throw new NotFoundException('Pawnshop not found');
    }

    const [slotsTotal, activeSlots, overdueSlots, productsTotal, itemsForSale] =
      await Promise.all([
        this.slotModel.countDocuments({ pawnshopId }),
        this.slotModel.countDocuments({
          pawnshopId,
          status: 'active',
        }),
        this.slotModel.countDocuments({
          pawnshopId,
          endDate: { $lt: new Date() },
          status: 'active',
        }),
        this.productModel.countDocuments({
          _id: { $in: pawnshop.products },
        }),
        this.productModel.countDocuments({
          _id: { $in: pawnshop.products },
          type: 'sale',
          status: 'active',
        }),
      ]);

    const slotUsagePercent = pawnshop.slotLimit
      ? Math.round((slotsTotal / pawnshop.slotLimit) * 100)
      : 0;

    return {
      slotsTotal,
      activeSlots,
      overdueSlots,
      productsTotal,
      itemsForSale,
      slotLimit: pawnshop.slotLimit,
      slotUsagePercent,
    };
  }


}
