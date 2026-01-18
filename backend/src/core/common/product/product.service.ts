import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product,ProductDocument } from 'src/core/database/schemas/product.schema';
import { CreateProductDto } from './product.dto';
import { UpdateProductDto } from './update-product.dto';
import { UserService } from '../user/user.service';
import { error } from 'console';
import { User, UserDocument } from 'src/core/database/schemas/user.schema';
import { Mode } from 'fs';
import { NotificationService } from '../notification/notification.service';
import cloudinary from 'src/core/config/cloudinary.config';


@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) 
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(User.name)                     // <-- обязательно!
    private readonly userModel: Model<UserDocument>,

    private notificationsService:NotificationService

  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel({
      ...dto,
      ownerId: new Types.ObjectId(dto.ownerId),
      photos: dto.photos?.length
        ? dto.photos
        : [
            {
              url: 'assets/png/iphone-11.jpg',
              publicId: 'default-iphone-11',
            }
          ],
    });

    return createdProduct.save();
  }

  async findAll(): Promise<Product[]> {
    const products = await this.productModel.find().lean().exec();
    return products.map(product => ({
      ...product,
      photos: product.photos.map(p =>
        typeof p === 'string' ? { url: p, publicId: '' } : p
      ),
    }))
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('ownerId', 'name email').lean().exec();
    if (!product) throw new NotFoundException('Product not found');

    // Нормализуем photos сразу
    product.photos = product.photos.map(p =>
      typeof p === 'string' ? { url: p, publicId: '' } : p
    );

    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.productModel.findById(id).exec();
    if (!existing) throw new NotFoundException('Product not found');

    if (dto.ownerId) {
      dto.ownerId = new Types.ObjectId(dto.ownerId) as any;
    }

    const isPriceChanged =
      dto.price !== undefined && dto.price !== existing.price;

    const updated = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Product not found');
    }

    if (isPriceChanged) {
      const users = await this.userModel
        .find({ favoriteItems: { $in: [id] } }, '_id')
        .lean()
        .exec();

      for (const user of users) {
        await this.notificationsService.create({
          userId: user._id.toString(),
          senderId: updated.ownerId.toString(),
          type: 'price-changed',
          title: 'Цена обновлена',
          message: `Цена продукта была изменена с ${existing.price}₸ на ${dto.price}₸.`,
          refId: id,
          isRead: false,
        });
      }
    }

    return updated;
  }


  async delete(id: string): Promise<{ message: string }> {
    const res = await this.productModel.findById(id).exec();
    if (!res) throw new NotFoundException('Product not found');

    if(res.photos && res.photos.length > 0){
      for(const img of res.photos){
        if(img.publicId){
          await cloudinary.uploader.destroy(img.publicId)
        }
      }
    }

    await this.productModel.findByIdAndDelete(id).exec();
    return { message: 'Product deleted successfully' };
  }

 async findByOwner(ownerId: string): Promise<Product[]> {
    const products = await this.productModel
      .find({ ownerId: new Types.ObjectId(ownerId) })
      .populate('ownerId', 'name email')
      .lean()
      .exec();

    return products.map(product => ({
      ...product,
      photos: product.photos.map(p =>
        typeof p === 'string' ? { url: p, publicId: '' } : p
      ),
    }));
  }
}
