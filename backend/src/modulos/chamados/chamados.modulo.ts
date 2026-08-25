import { Module } from '@nestjs/common';
// Agrupa a API e as regras de negócio dos chamados.
import { ControladorChamados } from './chamados.controlador';
import { ServicoChamados } from './chamados.servico';

@Module({
  controllers: [ControladorChamados],
  providers: [ServicoChamados],
})
export class ModuloChamados {}
