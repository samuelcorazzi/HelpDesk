import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ServicoPrisma } from './banco-de-dados/servico-prisma';

@Controller('status')
export class ControladorStatus {
  constructor(private readonly bancoDeDados: ServicoPrisma) {}

  @Get()
  async consultar(@Res({ passthrough: true }) resposta: Response) {
    const inicioVerificacao = Date.now();

    try {
      await this.bancoDeDados.user.findFirst({ select: { id: true } });

      return {
        servidorConectado: true,
        bancoConectado: true,
        verificadoEm: new Date().toISOString(),
        tempoRespostaMs: Date.now() - inicioVerificacao,
      };
    } catch {
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
