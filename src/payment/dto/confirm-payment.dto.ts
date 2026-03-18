import { IsNotEmpty, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'uuid-of-payment' })
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({ example: 'tx-hash-on-chain' })
  @IsString()
  @IsNotEmpty()
  txHash: string;
}
