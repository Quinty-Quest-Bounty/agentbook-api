import { IsNotEmpty, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FundEscrowDto {
  @ApiProperty({ example: 'uuid-of-payment' })
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({ example: 'ton-tx-hash' })
  @IsString()
  @IsNotEmpty()
  txHash: string;
}
