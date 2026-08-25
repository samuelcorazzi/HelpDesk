import { Injectable, UnauthorizedException } from '@nestjs/common';
// Extrai e valida o Bearer token antes de anexar o usuário à requisição.
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    servicoConfiguracao: ConfigService,
    private readonly usuarios: UsersService,
  ) {
    const segredo = servicoConfiguracao.get<string>('JWT_SECRET');

    if (!segredo) {
      throw new Error('Defina JWT_SECRET no arquivo backend/.env.');
    }

    super({
      // Espera o formato "Authorization: Bearer <token>" e também recusa tokens
      // expirados. A assinatura é conferida com o mesmo JWT_SECRET do login.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: segredo,
    });
  }

  async validate(conteudoToken: JwtPayload) {
    // Não basta a assinatura estar correta: a conta ainda precisa existir e
    // estar ativa. Assim, desativar um usuário invalida até tokens ainda válidos.
    const usuario = await this.usuarios.buscarPorIdParaAutenticacao(
      conteudoToken.sub,
    );

    if (!usuario || !usuario.active) {
      throw new UnauthorizedException('Usuário inválido ou desativado.');
    }

    // O objeto retornado pelo validate vira request.user nas rotas protegidas.
    return {
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
    };
  }
}
