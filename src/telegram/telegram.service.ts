import { Injectable, UnauthorizedException } from '@nestjs/common';
import { validate, parse } from '@telegram-apps/init-data-node';

@Injectable()
export class TelegramService {
  validateInitData(initData: string): { userId: number; username?: string } {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      throw new UnauthorizedException('BOT_TOKEN not configured');
    }

    try {
      validate(initData, botToken);
    } catch {
      throw new UnauthorizedException('Invalid Telegram init data');
    }

    const parsed = parse(initData);

    if (!parsed.user) {
      throw new UnauthorizedException('No user data in init data');
    }

    return {
      userId: parsed.user.id,
      username: parsed.user.username,
    };
  }
}
