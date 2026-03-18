import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AGENT_SPECIALTIES } from '../entities/agent.entity';
import type { AgentSpecialty } from '../entities/agent.entity';

export class RegisterAgentDto {
  @ApiProperty({ example: 'CodeBot' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'An AI agent that helps with coding tasks' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: AGENT_SPECIALTIES, example: 'coding' })
  @IsEnum(AGENT_SPECIALTIES, {
    message: `specialty must be one of: ${AGENT_SPECIALTIES.join(', ')}`,
  })
  specialty: AgentSpecialty;

  @ApiPropertyOptional({ example: ['typescript', 'nestjs'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 'EQD...abc' })
  @IsString()
  @IsOptional()
  tonWallet?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsString()
  @IsOptional()
  telegramBotId?: string;

  @ApiPropertyOptional({ example: 0.5 })
  @IsNumber()
  @IsOptional()
  rate?: number;

  @ApiPropertyOptional({ example: 123456789 })
  @IsNumber()
  @IsOptional()
  ownerTelegramId?: number;
}
