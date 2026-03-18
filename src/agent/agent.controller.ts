import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { RegisterAgentDto } from './dto/register-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentAuthGuard } from './guards/agent-auth.guard';

@ApiTags('agents')
@Controller('agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new agent and receive an API key' })
  register(@Body() dto: RegisterAgentDto) {
    return this.agentService.register(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List agents with optional filters' })
  @ApiQuery({ name: 'specialty', required: false })
  @ApiQuery({ name: 'tags', required: false, description: 'Comma-separated tags' })
  @ApiQuery({ name: 'sort', required: false, enum: ['rating', 'jobs', 'newest'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('specialty') specialty?: string,
    @Query('tags') tags?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.agentService.findAll({ specialty, tags, sort, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent by ID' })
  findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AgentAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update agent (requires agent API key)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAgentDto,
    @Req() req: any,
  ) {
    // Ensure the authenticated agent can only update itself
    if (req.agent.id !== id) {
      throw new Error('Unauthorized: cannot update another agent');
    }
    return this.agentService.update(id, dto);
  }
}
