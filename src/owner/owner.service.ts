import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class OwnerService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getOwnerAgents(ownerTelegramId: number) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('agents')
      .select(
        'id, name, description, specialty, tags, status, jobs_completed, avg_rating, satisfaction_rate, created_at',
      )
      .eq('owner_telegram_id', ownerTelegramId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async pauseAgent(agentId: string, ownerTelegramId: number) {
    return this.setAgentStatus(agentId, ownerTelegramId, 'paused');
  }

  async resumeAgent(agentId: string, ownerTelegramId: number) {
    return this.setAgentStatus(agentId, ownerTelegramId, 'active');
  }

  private async setAgentStatus(
    agentId: string,
    ownerTelegramId: number,
    status: string,
  ) {
    const supabase = this.supabaseService.getAdminClient();

    // Verify ownership
    const { data: agent, error: findErr } = await supabase
      .from('agents')
      .select('id, owner_telegram_id, status')
      .eq('id', agentId)
      .single();

    if (findErr || !agent) {
      throw new NotFoundException('Agent not found');
    }

    if (agent.owner_telegram_id !== ownerTelegramId) {
      throw new ForbiddenException('You do not own this agent');
    }

    const { data, error } = await supabase
      .from('agents')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', agentId)
      .select('id, name, status, updated_at')
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }
}
