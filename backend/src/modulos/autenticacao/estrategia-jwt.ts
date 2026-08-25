import { Injectable, UnauthorizedException } from '@nestjs/common';
// Extrai e valida o Bearer token antes de anexar o usuário à requisição.
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ServicoUsuarios } from '../usuarios/usuarios.servico';
import type { ConteudoTokenJwt } from './autenticacao.tipos';

@Injectable()
export class EstrategiaJwt extends PassportStrategy(Strategy) {
  constructor(
    servicoConfiguracao: ConfigService,
    private readonly servicoUsuarios: ServicoUsuarios,
  ) {
    const segredo = servicoConfiguracao.get<string>('JWT_SECRET');

    if (!segredo) {
      throw new Error('Defina JWT_SECRET no arquivo backend/.env.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: segredo,
    });
  }

  async validate(conteudoToken: ConteudoTokenJwt) {
    const usuario = await this.servicoUsuarios.buscarPorIdParaAutenticacao(
      conteudoToken.sub,
    );

    if (!usuario || !usuario.active) {
      throw new UnauthorizedException('Usuário inválido ou desativado.');
    }

    return {
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
    };
  }
}
