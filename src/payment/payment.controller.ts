import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { TelegramAuthGuard } from '../telegram/telegram-auth.guard';

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
}
