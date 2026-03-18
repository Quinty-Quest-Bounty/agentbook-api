import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterAgentDto } from './dto/register-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(dto: RegisterAgentDto) {
    const supabase = this.supabaseService.getAdminClient();

    // Generate API key
    const rawKey = `agb_live_${randomBytes(32).toString('hex')}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');

    const { data, error } = await supabase
      .from('agents')
      .insert({
        name: dto.name,
        description: dto.description || null,
        specialty: dto.specialty,
        tags: dto.tags || [],
        ton_wallet: dto.tonWallet || null,
        telegram_bot_id: dto.telegramBotId || null,
        owner_telegram_id: dto.ownerTelegramId || null,
        rate: dto.rate || null,
        api_key_hash: keyHash,
      })
      .select('id, name, specialty, created_at')
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      agent: data,
      apiKey: rawKey,
      message:
        'Store this API key securely — it will not be shown again.',
    };
  }

  async findAll(query: {
    specialty?: string;
    tags?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const supabase = this.supabaseService.getAdminClient();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let qb = supabase
      .from('agents')
      .select(
        'id, name, description, specialty, tags, ton_wallet, telegram_bot_id, rate, status, jobs_completed, avg_rating, satisfaction_rate, created_at',
        { count: 'exact' },
      )
      .eq('status', 'active');

    if (query.specialty) {
      qb = qb.eq('specialty', query.specialty);
    }

    if (query.tags) {
      const tagList = query.tags.split(',').map((t) => t.trim());
      qb = qb.overlaps('tags', tagList);
    }

    // Sorting
    switch (query.sort) {
      case 'rating':
        qb = qb.order('avg_rating', { ascending: false });
        break;
      case 'jobs':
        qb = qb.order('jobs_completed', { ascending: false });
        break;
      case 'newest':
        qb = qb.order('created_at', { ascending: false });
        break;
      default:
        qb = qb.order('created_at', { ascending: false });
    }

    qb = qb.range(offset, offset + limit - 1);

    const { data, error, count } = await qb;

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      agents: data,
      total: count,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('agents')
      .select(
        'id, name, description, specialty, tags, ton_wallet, telegram_bot_id, rate, status, jobs_completed, avg_rating, satisfaction_rate, created_at, updated_at',
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Agent not found');
    }

    return data;
  }

  async update(id: string, dto: UpdateAgentDto) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.specialty !== undefined) updateData.specialty = dto.specialty;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.tonWallet !== undefined) updateData.ton_wallet = dto.tonWallet;
    if (dto.telegramBotId !== undefined)
      updateData.telegram_bot_id = dto.telegramBotId;
    if (dto.rate !== undefined) updateData.rate = dto.rate;

    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', id)
      .select(
        'id, name, description, specialty, tags, ton_wallet, telegram_bot_id, rate, status, jobs_completed, avg_rating, satisfaction_rate, updated_at',
      )
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException('Agent not found');
    }

    return data;
  }
}
