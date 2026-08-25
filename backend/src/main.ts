import 'dotenv/config';
// Ponto de entrada: configura validação, CORS e a porta HTTP da API.
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ModuloPrincipal } from './modulo-principal';

async function iniciarAplicacao() {
  const aplicacao = await NestFactory.create(ModuloPrincipal);

  aplicacao.setGlobalPrefix('api');
  aplicacao.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  aplicacao.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3002',
  });

  await aplicacao.listen(process.env.PORT ?? 3001);
}

void iniciarAplicacao();
