import 'dotenv/config';
// Cliente Prisma com ciclo de vida controlado pelo NestJS.
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // A aplicação usa o transaction pooler; DIRECT_URL fica reservada para
    // migrations e outras operações que exigem uma conexão de sessão.
    const enderecoConexao = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

    if (!enderecoConexao) {
      throw new Error(
        'Defina DIRECT_URL ou DATABASE_URL no arquivo backend/.env.',
      );
    }

    super({
      adapter: new PrismaPg({ connectionString: enderecoConexao }),
    });
  }

  async onModuleInit(): Promise<void> {
    // Abre a conexão quando o módulo NestJS termina de iniciar.
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    // Libera a conexão durante o encerramento controlado da aplicação.
    await this.$disconnect();
  }
}
