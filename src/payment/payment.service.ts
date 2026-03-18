import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async initiatePayment(dto: InitiatePaymentDto, payerTelegramId: number) {
    const supabase = this.supabaseService.getAdminClient();

    // Verify agent exists
    const { data: agent, error: agentErr } = await supabase
      .from('agents')
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
      .from('payments')
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
      .from('payments')
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
      .from('payments')
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
}
