import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';
import { GuardaAutenticacaoJwt } from '../autenticacao/guarda-autenticacao-jwt';
import { GuardaPapeis } from '../autenticacao/guarda-papeis';
import { PapeisPermitidos } from '../autenticacao/papeis.decorador';
import {
  AtualizarStatusUsuarioDto,
  AtualizarUsuarioDto,
  CriarUsuarioDto,
} from './usuarios.dto';
import { ServicoUsuarios } from './usuarios.servico';

@Controller('users')
@UseGuards(GuardaAutenticacaoJwt, GuardaPapeis)
@PapeisPermitidos(Role.ADMIN)
export class ControladorUsuarios {
  constructor(private readonly servicoUsuarios: ServicoUsuarios) {}

  @Post()
  criar(@Body() dadosUsuario: CriarUsuarioDto) {
    return this.servicoUsuarios.criar(dadosUsuario);
  }

  @Get()
  listarTodos() {
    return this.servicoUsuarios.listarTodos();
  }

  @Get(':id')
  buscarPorId(@Param('id', new ParseUUIDPipe()) identificador: string) {
    return this.servicoUsuarios.buscarPorId(identificador);
  }

  @Patch(':id')
  atualizar(
    @Param('id', new ParseUUIDPipe()) identificador: string,
    @Body() dadosUsuario: AtualizarUsuarioDto,
  ) {
    return this.servicoUsuarios.atualizar(identificador, dadosUsuario);
  }

  @Patch(':id/status')
  atualizarStatus(
    @Param('id', new ParseUUIDPipe()) identificador: string,
    @Body() dadosStatus: AtualizarStatusUsuarioDto,
  ) {
    return this.servicoUsuarios.atualizarStatus(
      identificador,
      dadosStatus.active,
    );
  }
}
