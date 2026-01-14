import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/core/database/schemas/user.schema';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findOne(query: any): Promise<UserDocument | null> {
    return this.userModel.findOne(query).select('+password');
  }

  async create(user: any): Promise<UserDocument> {
    this.logger.log('Creating user.');
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async findOneById(userId:string):Promise<UserDocument | null>{
    return this.userModel.findById(userId);
  }

  async findOneAndUpdate(query: any, payload: any): Promise<UserDocument | null> {
    this.logger.log('Updating User.');
    return this.userModel.findOneAndUpdate(query, payload, {
      new: true,
      upsert: true,
    });
  }

  async findOneAndDelete(query: any): Promise<UserDocument | null> {
    this.logger.log('Deleting user.');
    return this.userModel.findOneAndDelete(query);
  }

  async addFavorite(userId: string, pawnshopId: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { favoritePawnshops: pawnshopId } }, // не добавит дубликат
      { new: true }
    ).populate('favoritePawnshops');
  }

  async addfavoriteItem(userId:string, productId:string){
    return this.userModel.findByIdAndUpdate(
      userId,
      {$addToSet: {favoriteItems:productId}},
      {new:true}
    ).populate('favoriteItems');
  }

  async removeFavoriteItem(userId:string, productId:string){
    return this.userModel.findByIdAndUpdate(
      userId,
      {$pull: {favoriteItems:productId}},
      {new : true}
    ).populate('favoriteItems')
  }

  async removeFavorite(userId: string, pawnshopId: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { favoritePawnshops: pawnshopId } },
      { new: true }
    ).populate('favoritePawnshops');
  }

  async getFavorites(userId: string) {
    return this.userModel.findById(userId).populate('favoritePawnshops');
  }
  async getFavoriteItems(userId:string){
    return this.userModel.findById(userId).populate('favoriteItems')
  }

  async setRefreshToken(userId: string, refreshToken: string | null) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    );
  }

  async findByRefreshToken(refreshToken: string) {
    return this.userModel.findOne({ refreshToken }).select('+refreshToken');
  }

}
