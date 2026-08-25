import { Module } from '@nestjs/common';
// Encapsula os casos de uso relacionados a usuários.
import { ControladorUsuarios } from './usuarios.controlador';
import { ServicoUsuarios } from './usuarios.servico';

@Module({
  controllers: [ControladorUsuarios],
  providers: [ServicoUsuarios],
  exports: [ServicoUsuarios],
})
export class ModuloUsuarios {}
