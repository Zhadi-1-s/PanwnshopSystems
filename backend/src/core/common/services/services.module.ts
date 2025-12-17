import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MailService],
  exports: [MailService], // чтобы использовать в других модулях
})
export class ServiceModule {}
