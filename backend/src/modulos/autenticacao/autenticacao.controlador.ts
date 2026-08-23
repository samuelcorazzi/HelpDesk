import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ServicoUsuarios } from '../usuarios/usuarios.servico';
import { DadosEntradaDto } from './autenticacao.dto';
import { ServicoAutenticacao } from './autenticacao.servico';
import type { RequisicaoAutenticada } from './autenticacao.tipos';
import { GuardaAutenticacaoJwt } from './guarda-autenticacao-jwt';

@Controller('auth')
export class ControladorAutenticacao {
  constructor(
    private readonly servicoAutenticacao: ServicoAutenticacao,
    private readonly servicoUsuarios: ServicoUsuarios,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  entrar(
    @Body() dadosEntrada: DadosEntradaDto,
    @Ip() enderecoIp: string,
    @Headers('user-agent') agenteUsuario?: string,
  ) {
    return this.servicoAutenticacao.entrar(dadosEntrada, {
      enderecoIp,
      agenteUsuario,
    });
  }

  @Get('me')
  @UseGuards(GuardaAutenticacaoJwt)
  obterPerfil(@Req() requisicao: RequisicaoAutenticada) {
    return this.servicoUsuarios.buscarPorId(requisicao.user.id);
  }
}
