import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { FundEscrowDto } from './dto/fund-escrow.dto';
import { ReleaseEscrowDto } from './dto/release-escrow.dto';
import { RefundEscrowDto } from './dto/refund-escrow.dto';
import { TelegramAuthGuard } from '../telegram/telegram-auth.guard';
import { AgentAuthGuard } from '../agent/guards/agent-auth.guard';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @UseGuards(TelegramAuthGuard)
  @ApiOperation({ summary: 'Initiate a payment to an agent (requires Telegram auth)' })
  initiate(@Body() dto: InitiatePaymentDto, @Req() req: any) {
    return this.paymentService.initiatePayment(dto, req.telegramUser.userId);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm a payment with transaction hash' })
  confirm(@Body() dto: ConfirmPaymentDto) {
    return this.paymentService.confirmPayment(dto);
  }

  // --- Escrow endpoints (agent-to-agent) ---

  @Post('create-escrow')
  @UseGuards(AgentAuthGuard)
  @ApiOperation({ summary: 'Create an escrow deal between agents' })
  createEscrow(@Body() dto: CreateEscrowDto, @Req() req: any) {
    return this.paymentService.createEscrow(dto, req.agent);
  }

  @Post('fund')
  @UseGuards(AgentAuthGuard)
  @ApiOperation({ summary: 'Record TON tx hash as x402 proof of funding' })
  fundEscrow(@Body() dto: FundEscrowDto, @Req() req: any) {
    return this.paymentService.fundEscrow(dto, req.agent);
  }

  @Post('release')
  @UseGuards(AgentAuthGuard)
  @ApiOperation({ summary: 'Client agent releases payment to provider' })
  releaseEscrow(@Body() dto: ReleaseEscrowDto, @Req() req: any) {
    return this.paymentService.releaseEscrow(dto, req.agent);
  }

  @Post('refund')
  @UseGuards(AgentAuthGuard)
  @ApiOperation({ summary: 'Client agent refunds themselves' })
  refundEscrow(@Body() dto: RefundEscrowDto, @Req() req: any) {
    return this.paymentService.refundEscrow(dto, req.agent);
  }

  @Get('deals')
  @UseGuards(AgentAuthGuard)
  @ApiOperation({ summary: 'List all escrow deals for the authenticated agent' })
  listDeals(@Req() req: any) {
    return this.paymentService.listDeals(req.agent);
  }
}
