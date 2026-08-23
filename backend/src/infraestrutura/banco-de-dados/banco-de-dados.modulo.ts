import { Global, Module } from '@nestjs/common';
import { ServicoPrisma } from './servico-prisma';

@Global()
@Module({
  providers: [ServicoPrisma],
  exports: [ServicoPrisma],
})
export class ModuloBancoDeDados {}
