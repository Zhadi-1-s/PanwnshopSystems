import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  @ApiOperation({summary:'Поиск пользователя по айди'})
  @ApiParam({name:'userId',description:'id пользователя'})
  async getUserById(
    @Param('userId') userId:string
  ){
    const user = await this.userService.findOneById(userId);
    if(!user) throw new NotFoundException('User not found');
    return user;
  }

  @Patch(':userId/favorites/:pawnshopId')
  @ApiOperation({ summary: 'Добавить магазин в избранное пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя', type: String })
  @ApiParam({ name: 'pawnshopId', description: 'ID ломбарда (магазина)', type: String })
  async addFavorite(
    @Param('userId') userId: string,
    @Param('pawnshopId') pawnshopId: string,
  ) {
    this.logger.log(`Добавление pawnshop ${pawnshopId} в избранное пользователя ${userId}`);
    const user = await this.userService.addFavorite(userId, pawnshopId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Delete(':userId/favorites/:pawnshopId')
  @ApiOperation({ summary: 'Удалить магазин из избранного пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя', type: String })
  @ApiParam({ name: 'pawnshopId', description: 'ID ломбарда (магазина)', type: String })
  async removeFavorite(
    @Param('userId') userId: string,
    @Param('pawnshopId') pawnshopId: string,
  ) {
    this.logger.log(`Удаление pawnshop ${pawnshopId} из избранного пользователя ${userId}`);
    const user = await this.userService.removeFavorite(userId, pawnshopId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Get(':userId/favorites')
  @ApiOperation({ summary: 'Получить все избранные магазины пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя', type: String })
  async getFavorites(@Param('userId') userId: string) {
    const user = await this.userService.getFavorites(userId);
    if (!user) throw new NotFoundException('User not found');
    return user.favoritePawnshops; // можно вернуть только массив избранных
  }

   @Patch(':userId/favorite-items/:productId')
  @ApiOperation({ summary: 'Добавить товар в избранное пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя', type: String })
  @ApiParam({ name: 'productId', description: 'ID товара', type: String })
  async addFavoriteItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {

    const user = await this.userService.addfavoriteItem(userId, productId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Delete(':userId/favorite-items/:productId')
  @ApiOperation({ summary: 'Удалить товар из избранного пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя', type: String })
  @ApiParam({ name: 'productId', description: 'ID товара', type: String })
  async removeFavoriteItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {

    const user = await this.userService.removeFavoriteItem(userId, productId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Get(':userId/favorite-items')
  @ApiOperation({ summary: 'Получить все избранные товары пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя', type: String })
  async getFavoriteItems(@Param('userId') userId: string) {
    
    const user = await this.userService.getFavoriteItems(userId);
    if (!user) throw new NotFoundException('User not found');
    return user.favoriteItems;
  }

}
