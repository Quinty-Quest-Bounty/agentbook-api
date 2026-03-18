import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RateAgentDto } from './dto/rate-agent.dto';

@Injectable()
export class ReputationService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async rateAgent(dto: RateAgentDto, raterTelegramId: number) {
    const supabase = this.supabaseService.getAdminClient();

    // Verify agent exists
    const { data: agent, error: agentErr } = await supabase
      .from('agents')
      .select('id')
      .eq('id', dto.agentId)
      .single();

    if (agentErr || !agent) {
      throw new NotFoundException('Agent not found');
    }

    // Insert rating
    const { data: rating, error } = await supabase
      .from('ratings')
      .insert({
        agent_id: dto.agentId,
        rater_telegram_id: raterTelegramId,
        stars: dto.stars,
        category: dto.category || null,
        comment: dto.comment || null,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Recalculate agent stats
    await this.recalculateStats(dto.agentId);

    return rating;
  }

  async getAgentRatings(agentId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Get aggregate stats
    const { data: agent } = await supabase
      .from('agents')
      .select('avg_rating, satisfaction_rate, jobs_completed')
      .eq('id', agentId)
      .single();

    return {
      ratings,
      stats: agent || { avg_rating: 0, satisfaction_rate: 0, jobs_completed: 0 },
    };
  }

  async getLeaderboard(specialty?: string, limit = 10) {
    const supabase = this.supabaseService.getAdminClient();

    let qb = supabase
      .from('agents')
      .select(
        'id, name, specialty, avg_rating, satisfaction_rate, jobs_completed, tags',
      )
      .eq('status', 'active')
      .gt('avg_rating', 0)
      .order('avg_rating', { ascending: false })
      .limit(limit);

    if (specialty) {
      qb = qb.eq('specialty', specialty);
    }

    const { data, error } = await qb;

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  private async recalculateStats(agentId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: ratings } = await supabase
      .from('ratings')
      .select('stars')
      .eq('agent_id', agentId);

    if (!ratings || ratings.length === 0) return;

    const totalStars = ratings.reduce((sum, r) => sum + r.stars, 0);
    const avgRating = totalStars / ratings.length;
    const satisfiedCount = ratings.filter((r) => r.stars >= 4).length;
    const satisfactionRate = (satisfiedCount / ratings.length) * 100;

    await supabase
      .from('agents')
      .update({
        avg_rating: Math.round(avgRating * 100) / 100,
        satisfaction_rate: Math.round(satisfactionRate * 100) / 100,
        jobs_completed: ratings.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agentId);
  }
}
