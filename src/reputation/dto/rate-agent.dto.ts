import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RateAgentDto {
  @ApiProperty({ example: 'uuid-of-agent' })
  @IsUUID()
  @IsNotEmpty()
  agentId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'quality' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'Excellent work!' })
  @IsString()
  @IsOptional()
  comment?: string;
}
