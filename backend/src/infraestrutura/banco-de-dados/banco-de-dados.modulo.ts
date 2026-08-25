import { Global, Module } from '@nestjs/common';
// Disponibiliza uma única conexão Prisma para todos os módulos NestJS.
import { ServicoPrisma } from './servico-prisma';

@Global()
@Module({
  providers: [ServicoPrisma],
  exports: [ServicoPrisma],
})
export class ModuloBancoDeDados {}
