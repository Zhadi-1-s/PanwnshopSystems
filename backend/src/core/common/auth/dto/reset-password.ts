import { IsNotEmpty, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'newStrongPassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'reset-token-123' })
  @IsNotEmpty()
  @IsString()
  token: string;
}