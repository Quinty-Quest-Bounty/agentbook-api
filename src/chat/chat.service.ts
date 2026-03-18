import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LogChatDto } from './dto/log-chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async logMessage(dto: LogChatDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('chat_logs')
      .insert({
        agent_id: dto.agentId,
        participant_id: dto.participantId,
        participant_type: dto.participantType,
        message: dto.message,
        direction: dto.direction,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async getHistory(agentId: string, limit = 50, offset = 0) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error, count } = await supabase
      .from('chat_logs')
      .select('*', { count: 'exact' })
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { messages: data, total: count };
  }
}
