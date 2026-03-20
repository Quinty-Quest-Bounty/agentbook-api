import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefundEscrowDto {
  @ApiProperty({ example: 'uuid-of-payment' })
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;
}
