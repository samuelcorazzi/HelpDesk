import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// Autoriza a rota apenas quando o papel do token consta nos metadados da rota.
import { Reflector } from '@nestjs/core';
import type { Role } from '../../generated/prisma/enums';
import type { RequisicaoAutenticada } from './auth.types';
import { ROLES_KEY } from './roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly refletor: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    // O Reflector lê os papéis gravados por @Roles na rota ou na
    // classe inteira. getAllAndOverride dá prioridade ao método mais específico.
    const roles = this.refletor.getAllAndOverride<Role[]>(ROLES_KEY, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);

    // Sem restrição declarada, qualquer usuário que passou pelo JWT pode entrar.
    if (!roles?.length) return true;

    const requisicao = contexto
      .switchToHttp()
      .getRequest<RequisicaoAutenticada>();

    // Em conjunto com JwtAuthGuard, request.user já está preenchido.
    return roles.includes(requisicao.user.role);
  }
}
