import 'dotenv/config';
// Ponto de entrada: configura validação, CORS e a porta HTTP da API.
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function iniciarAplicacao() {
  // O NestFactory percorre o AppModule e cria todas as dependências
  // declaradas nos módulos: controladores, serviços, Prisma, JWT etc.
  const aplicacao = await NestFactory.create(AppModule);

  // Com o prefixo global, @Controller('users') vira /api/users, por exemplo.
  aplicacao.setGlobalPrefix('api');
  aplicacao.useGlobalPipes(
    new ValidationPipe({
      // Rejeita campos que não existem no DTO, converte valores quando possível
      // e remove propriedades não autorizadas antes de chegar ao controlador.
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  aplicacao.enableCors({
    // CORS permite que o frontend, servido em outra porta, chame esta API.
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3002',
  });

  // A porta 3001 é o padrão local; em hospedagem, PORT costuma ser injetada.
  await aplicacao.listen(process.env.PORT ?? 3001);
}

void iniciarAplicacao();
