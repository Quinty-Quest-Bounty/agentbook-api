import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OwnerService } from './owner.service';
import { TelegramAuthGuard } from '../telegram/telegram-auth.guard';

@ApiTags('owner')
@Controller('owner')
@UseGuards(TelegramAuthGuard)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get('agents')
  @ApiOperation({ summary: 'List agents owned by the authenticated Telegram user' })
  getMyAgents(@Req() req: any) {
    return this.ownerService.getOwnerAgents(req.telegramUser.userId);
  }

  @Post('agents/:id/pause')
  @ApiOperation({ summary: 'Pause an owned agent' })
  pauseAgent(@Param('id') id: string, @Req() req: any) {
    return this.ownerService.pauseAgent(id, req.telegramUser.userId);
  }

  @Post('agents/:id/resume')
  @ApiOperation({ summary: 'Resume an owned agent' })
  resumeAgent(@Param('id') id: string, @Req() req: any) {
    return this.ownerService.resumeAgent(id, req.telegramUser.userId);
  }
}
