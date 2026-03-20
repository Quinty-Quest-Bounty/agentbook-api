import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReleaseEscrowDto {
  @ApiProperty({ example: 'uuid-of-payment' })
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;
}
