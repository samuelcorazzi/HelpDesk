import {
  // Rotas públicas de login e rota protegida para consultar o perfil atual.
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
import { UsersService } from '../users/users.service';
import { LoginDto } from './auth.dto';
import { AuthService } from './auth.service';
import type { RequisicaoAutenticada } from './auth.types';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  // A injeção pelo construtor permite que o controlador apenas traduza HTTP
  // para chamadas de serviço, sem concentrar nele as regras de negócio.
  constructor(
    private readonly autenticacao: AuthService,
    private readonly usuarios: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  entrar(
    @Body() dadosEntrada: LoginDto,
    @Ip() enderecoIp: string,
    @Headers('user-agent') agenteUsuario?: string,
  ) {
    // O DTO já chegou validado pelo ValidationPipe global. IP e user-agent não
    // participam da autenticação; são enviados somente para a auditoria.
    return this.autenticacao.entrar(dadosEntrada, {
      enderecoIp,
      agenteUsuario,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  obterPerfil(@Req() requisicao: RequisicaoAutenticada) {
    // Se o guard aceitou o token, a estratégia JWT já colocou o usuário em
    // requisicao.user. A rota usa o id confiável do token, não um id do cliente.
    return this.usuarios.buscarPorId(requisicao.user.id);
  }
}
