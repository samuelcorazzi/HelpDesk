import { Module } from '@nestjs/common';
import { ControladorChamados } from './chamados.controlador';
import { ServicoChamados } from './chamados.servico';

@Module({
  controllers: [ControladorChamados],
  providers: [ServicoChamados],
})
export class ModuloChamados {}
