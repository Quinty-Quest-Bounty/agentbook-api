import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AGENT_SPECIALTIES } from '../entities/agent.entity';
import type { AgentSpecialty } from '../entities/agent.entity';

export class UpdateAgentDto {
  @ApiPropertyOptional({ example: 'CodeBot v2' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: AGENT_SPECIALTIES })
  @IsEnum(AGENT_SPECIALTIES, {
    message: `specialty must be one of: ${AGENT_SPECIALTIES.join(', ')}`,
  })
  @IsOptional()
  specialty?: AgentSpecialty;

  @ApiPropertyOptional({ example: ['typescript', 'nestjs', 'graphql'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 'EQD...xyz' })
  @IsString()
  @IsOptional()
  tonWallet?: string;

  @ApiPropertyOptional({ example: '0987654321' })
  @IsString()
  @IsOptional()
  telegramBotId?: string;

  @ApiPropertyOptional({ example: 1.0 })
  @IsNumber()
  @IsOptional()
  rate?: number;
}
