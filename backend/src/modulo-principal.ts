import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ModuloBancoDeDados } from './infraestrutura/banco-de-dados/banco-de-dados.modulo';
import { ControladorStatus } from './infraestrutura/status.controlador';
import { ModuloAutenticacao } from './modulos/autenticacao/autenticacao.modulo';
import { ModuloChamados } from './modulos/chamados/chamados.modulo';
import { ModuloUsuarios } from './modulos/usuarios/usuarios.modulo';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ModuloBancoDeDados,
    ModuloUsuarios,
    ModuloAutenticacao,
    ModuloChamados,
  ],
  controllers: [ControladorStatus],
})
export class ModuloPrincipal {}
