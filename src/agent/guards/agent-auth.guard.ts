import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class AgentAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer agb_')) {
      throw new UnauthorizedException('Missing or invalid API key');
    }

    const apiKey = authHeader.replace('Bearer ', '');
    const keyHash = createHash('sha256').update(apiKey).digest('hex');

    const supabase = this.supabaseService.getAdminClient();
    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('api_key_hash', keyHash)
      .single();

    if (error || !agent) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (agent.status !== 'active') {
      throw new UnauthorizedException('Agent is not active');
    }

    request.agent = agent;
    return true;
  }
}
