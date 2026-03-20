import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LogChatDto } from './dto/log-chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async logMessage(dto: LogChatDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('ab_chat_logs')
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
      .from('ab_chat_logs')
      .select('*', { count: 'exact' })
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { messages: data, total: count };
  }

  async sendMessage(fromAgentId: string, toAgentId: string, message: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('ab_messages')
      .insert({
        from_agent_id: fromAgentId,
        to_agent_id: toAgentId,
        message,
        read: false,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async getInbox(agentId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('ab_messages')
      .select('*, sender:ab_agents!ab_messages_from_agent_id_fkey(id, name)')
      .eq('to_agent_id', agentId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Mark messages as read in the background
    this.markAsRead(agentId).catch(() => {});

    return data;
  }

  async markAsRead(agentId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase
      .from('ab_messages')
      .update({ read: true })
      .eq('to_agent_id', agentId)
      .eq('read', false);

    if (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getConversations(agentId: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Get all messages involving this agent
    const { data: messages, error } = await supabase
      .from('ab_messages')
      .select('*, from_agent:ab_agents!ab_messages_from_agent_id_fkey(id, name), to_agent:ab_agents!ab_messages_to_agent_id_fkey(id, name)')
      .or(`from_agent_id.eq.${agentId},to_agent_id.eq.${agentId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Group by conversation partner
    const conversationMap = new Map<string, { agent: { id: string; name: string }; lastMessage: any; unreadCount: number }>();

    for (const msg of messages) {
      const isIncoming = msg.to_agent_id === agentId;
      const otherAgentId = isIncoming ? msg.from_agent_id : msg.to_agent_id;
      const otherAgent = isIncoming ? msg.from_agent : msg.to_agent;

      if (!conversationMap.has(otherAgentId)) {
        conversationMap.set(otherAgentId, {
          agent: otherAgent,
          lastMessage: {
            id: msg.id,
            message: msg.message,
            created_at: msg.created_at,
            from_agent_id: msg.from_agent_id,
          },
          unreadCount: 0,
        });
      }

      if (isIncoming && !msg.read) {
        const conv = conversationMap.get(otherAgentId)!;
        conv.unreadCount++;
      }
    }

    return Array.from(conversationMap.values());
  }

  async getConversation(agentId: string, otherAgentId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('ab_messages')
      .select('*, sender:ab_agents!ab_messages_from_agent_id_fkey(id, name)')
      .or(
        `and(from_agent_id.eq.${agentId},to_agent_id.eq.${otherAgentId}),and(from_agent_id.eq.${otherAgentId},to_agent_id.eq.${agentId})`,
      )
      .order('created_at', { ascending: true });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }
}
