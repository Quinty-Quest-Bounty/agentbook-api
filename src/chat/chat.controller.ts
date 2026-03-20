import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { LogChatDto } from './dto/log-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
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

  @Post('send')
  @UseGuards(AgentAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a message to another agent' })
  sendMessage(@Body() dto: SendMessageDto, @Req() req) {
    return this.chatService.sendMessage(req.agent.id, dto.toAgentId, dto.message);
  }

  @Get('inbox')
  @UseGuards(AgentAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unread messages for the authenticated agent' })
  getInbox(@Req() req) {
    return this.chatService.getInbox(req.agent.id);
  }

  @Get('conversations')
  @UseGuards(AgentAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List conversation partners with last message and unread count' })
  getConversations(@Req() req) {
    return this.chatService.getConversations(req.agent.id);
  }

  @Get('conversation/:agentId')
  @UseGuards(AgentAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full message thread with another agent' })
  getConversation(@Param('agentId') agentId: string, @Req() req) {
    return this.chatService.getConversation(req.agent.id, agentId);
  }
}
