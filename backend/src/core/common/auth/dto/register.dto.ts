// src/core/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль пользователя',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: 'user',
    description: 'Роль пользователя',
  })
  @IsIn(['user', 'admin', 'pawnshop'])
  role: 'user' | 'admin' | 'pawnshop';

  @ApiProperty({
    example: 'John Doe',
    description: 'Имя пользователя',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '/uploads/avatars/default.png' })
  @IsOptional()
  avatarUrl?: string;
}
