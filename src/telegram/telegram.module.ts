import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramAuthGuard } from './telegram-auth.guard';

@Module({
  providers: [TelegramService, TelegramAuthGuard],
  exports: [TelegramService, TelegramAuthGuard],
})
export class TelegramModule {}
