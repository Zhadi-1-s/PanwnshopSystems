import { Injectable, Logger, UnauthorizedException,ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../services/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService:ConfigService
  ) {}

  // Регистрация пользователя
  async register(dto: RegisterDto) {
    const existingUser = await this.userService.findOne({ email: dto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.getHashedPassword(dto.password);

    const user = await this.userService.create({
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      name: dto.name,
      avatarUrl: dto.avatarUrl
    });

    
    const access_token = this.generateAccessToken(user);
    const refresh_token = this.generateRefreshToken(user);
    
    await this.userService.setRefreshToken(user._id.toString(), refresh_token);
    
    const { password: _, ...result } = user.toObject();

    return { ...result, access_token, refresh_token };
  }

  updateUser(userId:string,UserData: Partial<any>):Promise<any>{
    this.userService.findOneAndUpdate({_id:userId}, UserData);
    return this.getProfile(userId);
  }

  async getProfile(userId: string) {
    const user = await this.userService.findOne({ _id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user.toObject(); // убираем пароль
    return result;
  }

  async requestPasswordReset(email:string){

    const user = await this.userService.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = this.jwtService.sign(
      {sub:user._id, email:user.email},
      {expiresIn:'15m'}
    );

    await this.mailService.sendMail(
      user.email,
      'Password Reset Request',
      `Please use the following token to reset your password: ${resetToken}`,
      `<p>Для сброса пароля перейдите по ссылке: 
        <a href="http://localhost:4200/reset-password?token=${resetToken}">
          Reset Password
        </a>
      </p>`
    );

    return {message: 'Password reset email sent'}

  };

  async resetPassword(token:string, newPassword:string){
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findOne({ _id: payload.sub });
      if(!user) throw new NotFoundException('Invalid token');

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return {message: 'Password has been reset successfully'}
    } catch (err){
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Хеширование пароля
  async getHashedPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  // Проверка пароля
  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Проверка пользователя по email и паролю
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne({ email });
    if (user && (await this.comparePasswords(pass, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  // Авторизация и генерация токена
  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);

    // генерируем оба токена
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // сохраняем refresh token в базе
    await this.userService.setRefreshToken(user._id, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(userId: string) {
    await this.userService.setRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  private generateAccessToken(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });
  }

  private generateRefreshToken(user: any) {
    const payload = { sub: user._id };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });
  }

  async refreshToken(oldRefreshToken: string) {
    try {
      const payload = this.jwtService.verify(oldRefreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userService.findOne({ _id: payload.sub });

      if (!user || user.refreshToken !== oldRefreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      await this.userService.setRefreshToken(user._id.toString(), newRefreshToken);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }


}

