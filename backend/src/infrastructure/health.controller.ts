import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from './database/prisma.service';

@Controller('status')
export class HealthController {
  constructor(private readonly bancoDeDados: PrismaService) {}

  @Get()
  async consultar(@Res({ passthrough: true }) resposta: Response) {
    // Esta rota funciona como um "health check": o servidor só considera o
    // banco disponível se uma consulta Prisma simples também for bem-sucedida.
    const inicioVerificacao = Date.now();

    try {
      // Selecionar apenas o id reduz os dados trafegados; não importa se existe
      // usuário, mas sim se o PostgreSQL conseguiu responder à consulta.
      await this.bancoDeDados.user.findFirst({ select: { id: true } });

      return {
        servidorConectado: true,
        bancoConectado: true,
        verificadoEm: new Date().toISOString(),
        tempoRespostaMs: Date.now() - inicioVerificacao,
      };
    } catch {
      // O Nest continua respondendo, mas usa HTTP 503 para informar que uma
      // dependência essencial (o banco) está indisponível.
      resposta.status(HttpStatus.SERVICE_UNAVAILABLE);

      return {
        servidorConectado: true,
        bancoConectado: false,
        verificadoEm: new Date().toISOString(),
        tempoRespostaMs: Date.now() - inicioVerificacao,
      };
    }
  }
}
