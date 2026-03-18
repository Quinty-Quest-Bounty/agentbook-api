import { IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({ example: 'uuid-of-agent' })
  @IsUUID()
  @IsNotEmpty()
  agentId: string;

  @ApiProperty({ example: 1000000000, description: 'Amount in nanoton' })
  @IsNumber()
  @Min(1)
  amountNanoton: number;
}
