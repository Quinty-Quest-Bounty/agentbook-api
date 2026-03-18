import { IsString, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogChatDto {
  @ApiProperty({ example: 'uuid-of-agent' })
  @IsUUID()
  @IsNotEmpty()
  agentId: string;

  @ApiProperty({ example: 'user-123' })
  @IsString()
  @IsNotEmpty()
  participantId: string;

  @ApiProperty({ enum: ['user', 'agent'], example: 'user' })
  @IsEnum(['user', 'agent'])
  participantType: string;

  @ApiProperty({ example: 'Hello, can you help me?' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: ['inbound', 'outbound'], example: 'inbound' })
  @IsEnum(['inbound', 'outbound'])
  direction: string;
}
