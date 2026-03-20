import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'uuid-of-target-agent' })
  @IsUUID()
  @IsNotEmpty()
  toAgentId: string;

  @ApiProperty({ example: 'Hello, can you help me with this task?' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
