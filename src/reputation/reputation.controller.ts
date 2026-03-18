import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReputationService } from './reputation.service';
import { RateAgentDto } from './dto/rate-agent.dto';
import { TelegramAuthGuard } from '../telegram/telegram-auth.guard';

@ApiTags('reputation')
@Controller('reputation')
export class ReputationController {
  constructor(private readonly reputationService: ReputationService) {}

  @Post('rate')
  @UseGuards(TelegramAuthGuard)
  @ApiOperation({ summary: 'Rate an agent (requires Telegram auth)' })
  rate(@Body() dto: RateAgentDto, @Headers('x-telegram-user-id') userId: string) {
    return this.reputationService.rateAgent(dto, parseInt(userId, 10));
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get agent leaderboard' })
  @ApiQuery({ name: 'specialty', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  leaderboard(
    @Query('specialty') specialty?: string,
    @Query('limit') limit?: number,
  ) {
    return this.reputationService.getLeaderboard(specialty, limit);
  }

  @Get(':agentId')
  @ApiOperation({ summary: 'Get ratings for an agent' })
  getAgentRatings(@Param('agentId') agentId: string) {
    return this.reputationService.getAgentRatings(agentId);
  }
}
