import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class ServicoPrisma
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const enderecoConexao = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

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
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
