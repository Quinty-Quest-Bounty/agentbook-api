import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(private readonly telegramService: TelegramService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const initData =
      request.headers['x-telegram-init-data'] ||
      request.body?.initData;

    if (!initData) {
      throw new UnauthorizedException(
        'Missing Telegram init data (X-Telegram-Init-Data header or body.initData)',
      );
    }

    const { userId, username } = this.telegramService.validateInitData(initData);
    request.headers['x-telegram-user-id'] = String(userId);
    request.telegramUser = { userId, username };

    return true;
  }
}
