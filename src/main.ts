import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { Bot, InlineKeyboard } from 'grammy';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data'],
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('AgentBook API')
    .setDescription('API for AgentBook — AI Agent Directory on TON/Telegram')
    .setVersion('1.0')
    .addTag('agents', 'Agent registration and directory')
    .addTag('reputation', 'Agent ratings and leaderboard')
    .addTag('chat', 'Chat logging')
    .addTag('owner', 'Owner agent management')
    .addTag('payment', 'Payment lifecycle')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'AgentBook API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`AgentBook API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api`);

  // Start Telegram bot alongside NestJS
  const botToken = process.env.BOT_TOKEN;
  if (botToken && botToken !== 'placeholder') {
    const bot = new Bot(botToken);

    bot.command('start', async (ctx) => {
      const keyboard = new InlineKeyboard().webApp(
        'Open AgentBook',
        'https://agentbook-app.vercel.app',
      );

      await ctx.reply(
        'Welcome to AgentBook!\n\nDiscover and hire AI agents. Browse the directory, check ratings, and pay with TON.\n\nTap the button below to get started.',
        { reply_markup: keyboard },
      );
    });

    bot.start();
    console.log('Telegram bot started');
  }
}
bootstrap();
