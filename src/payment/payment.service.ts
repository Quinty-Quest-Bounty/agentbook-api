import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { FundEscrowDto } from './dto/fund-escrow.dto';
import { ReleaseEscrowDto } from './dto/release-escrow.dto';
import { RefundEscrowDto } from './dto/refund-escrow.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async initiatePayment(dto: InitiatePaymentDto, payerTelegramId: number) {
    const supabase = this.supabaseService.getAdminClient();

    // Verify agent exists
    const { data: agent, error: agentErr } = await supabase
      .from('ab_agents')
      .select('id, status')
      .eq('id', dto.agentId)
      .single();

    if (agentErr || !agent) {
      throw new NotFoundException('Agent not found');
    }

    if (agent.status !== 'active') {
      throw new BadRequestException('Agent is not active');
    }

    const { data: payment, error } = await supabase
      .from('ab_payments')
      .insert({
        agent_id: dto.agentId,
        payer_telegram_id: payerTelegramId,
        amount_nanoton: dto.amountNanoton,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return payment;
  }

  async confirmPayment(dto: ConfirmPaymentDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: payment, error: findErr } = await supabase
      .from('ab_payments')
      .select('*')
      .eq('id', dto.paymentId)
      .single();

    if (findErr || !payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'pending') {
      throw new BadRequestException(
        `Payment is already ${payment.status}`,
      );
    }

    const { data, error } = await supabase
      .from('ab_payments')
      .update({
        status: 'confirmed',
        tx_hash: dto.txHash,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', dto.paymentId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  // --- Escrow methods ---

  async createEscrow(dto: CreateEscrowDto, agent: any) {
    const supabase = this.supabaseService.getAdminClient();

    // Verify provider agent exists
    const { data: provider, error: provErr } = await supabase
      .from('ab_agents')
      .select('id, status')
      .eq('id', dto.providerAgentId)
      .single();

    if (provErr || !provider) {
      throw new NotFoundException('Provider agent not found');
    }

    if (provider.status !== 'active') {
      throw new BadRequestException('Provider agent is not active');
    }

    const { data: payment, error } = await supabase
      .from('ab_payments')
      .insert({
        client_agent_id: agent.id,
        provider_agent_id: dto.providerAgentId,
        amount_nanoton: dto.amount,
        escrow_state: 'created',
        description: dto.description || null,
        payer_telegram_id: 0,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return payment;
  }

  async fundEscrow(dto: FundEscrowDto, agent: any) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: payment, error: findErr } = await supabase
      .from('ab_payments')
      .select('*')
      .eq('id', dto.paymentId)
      .single();

    if (findErr || !payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.client_agent_id !== agent.id) {
      throw new ForbiddenException('Not the client agent of this deal');
    }

    if (payment.escrow_state !== 'created') {
      throw new BadRequestException(
        `Escrow is already ${payment.escrow_state}`,
      );
    }

    const { data, error } = await supabase
      .from('ab_payments')
      .update({
        escrow_state: 'funded',
        tx_hash: dto.txHash,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', dto.paymentId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async releaseEscrow(dto: ReleaseEscrowDto, agent: any) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: payment, error: findErr } = await supabase
      .from('ab_payments')
      .select('*')
      .eq('id', dto.paymentId)
      .single();

    if (findErr || !payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.client_agent_id !== agent.id) {
      throw new ForbiddenException('Not the client agent of this deal');
    }

    if (payment.escrow_state !== 'funded') {
      throw new BadRequestException(
        `Cannot release: escrow is ${payment.escrow_state}`,
      );
    }

    const { data, error } = await supabase
      .from('ab_payments')
      .update({
        escrow_state: 'released',
        released_at: new Date().toISOString(),
      })
      .eq('id', dto.paymentId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Increment provider's jobs_completed
    const { error: incErr } = await supabase.rpc('increment_jobs_completed', {
      agent_id_input: payment.provider_agent_id,
    });

    // If the RPC doesn't exist, fall back to manual increment
    if (incErr) {
      const { data: providerAgent } = await supabase
        .from('ab_agents')
        .select('jobs_completed')
        .eq('id', payment.provider_agent_id)
        .single();

      if (providerAgent) {
        await supabase
          .from('ab_agents')
          .update({
            jobs_completed: (providerAgent.jobs_completed || 0) + 1,
          })
          .eq('id', payment.provider_agent_id);
      }
    }

    return data;
  }

  async refundEscrow(dto: RefundEscrowDto, agent: any) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: payment, error: findErr } = await supabase
      .from('ab_payments')
      .select('*')
      .eq('id', dto.paymentId)
      .single();

    if (findErr || !payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.client_agent_id !== agent.id) {
      throw new ForbiddenException('Not the client agent of this deal');
    }

    if (payment.escrow_state !== 'funded') {
      throw new BadRequestException(
        `Cannot refund: escrow is ${payment.escrow_state}`,
      );
    }

    const { data, error } = await supabase
      .from('ab_payments')
      .update({
        escrow_state: 'refunded',
      })
      .eq('id', dto.paymentId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async listDeals(agent: any) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('ab_payments')
      .select(
        '*, client:ab_agents!client_agent_id(id, name), provider:ab_agents!provider_agent_id(id, name)',
      )
      .or(`client_agent_id.eq.${agent.id},provider_agent_id.eq.${agent.id}`)
      .not('escrow_state', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }
}
