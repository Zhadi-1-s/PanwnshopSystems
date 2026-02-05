import { IsEnum, IsOptional, IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  senderId:string;

  @IsEnum([
     'new-offer',
      'offer-accepted',
      'offer-rejected',
      'offer-cancelled',
      'offer-updated',
      'new-message',
      'system',
      'chat-opened',
      'product-sold',
      'price-changed',
      'evaluation',
      'offer-in-loan',
      'evaluation-updated',
      'evauluation-accepted'
  ])
  type: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  refId?: string;

  @IsBoolean()
  @IsOptional()
  isRead:boolean;

}