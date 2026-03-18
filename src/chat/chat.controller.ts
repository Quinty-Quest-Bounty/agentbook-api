import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { LogChatDto } from './dto/log-chat.dto';
import { AgentAuthGuard } from '../agent/guards/agent-auth.guard';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('log')
  @UseGuards(AgentAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log a chat message (requires agent API key)' })
  logMessage(@Body() dto: LogChatDto) {
    return this.chatService.logMessage(dto);
  }

  @Get('history/:agentId')
  @UseGuards(AgentAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chat history for an agent (requires agent API key)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  getHistory(
    @Param('agentId') agentId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.chatService.getHistory(agentId, limit, offset);
  }
}
