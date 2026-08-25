import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// Autoriza a rota apenas quando o papel do token consta nos metadados da rota.
import { Reflector } from '@nestjs/core';
import type { Role } from '../../generated/prisma/enums';
import type { RequisicaoAutenticada } from './auth.types';
import { ROLES_KEY } from './roles';

//canActivate é uma interface padrao do nest para criacao de guards, ele libera a rota ou bloqueia ela
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly refletor: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    // adiciona uma camda de seguranca, mesmo que alguem altere alguma regra que de privilegios
    // o reflector transcreve ela
    const roles = this.refletor.getAllAndOverride<Role[]>(ROLES_KEY, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);

    // Sem restrição declarada, qualquer usuário que passou pelo JWT pode entrar.
    if (!roles?.length) return true;

    // permite que o mesmo guard funcione em HTTP, WebSockets ou Microserviços. Essa linha extrai o objeto de requisição (req) do ambiente HTTP Express/Fastify.
    const requisicao = contexto
      .switchToHttp()
      .getRequest<RequisicaoAutenticada>();

    // Em conjunto com JwtAuthGuard, request.user já está preenchido.
    return roles.includes(requisicao.user.role);
  }
}
