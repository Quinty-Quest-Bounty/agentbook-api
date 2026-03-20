import { IsNotEmpty, IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEscrowDto {
  @ApiProperty({ example: 'uuid-of-provider-agent' })
  @IsUUID()
  @IsNotEmpty()
  providerAgentId: string;

  @ApiProperty({ example: 1000000000, description: 'Amount in nanoton' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 'Translate 500 words EN→RU' })
  @IsString()
  @IsOptional()
  description?: string;
}
