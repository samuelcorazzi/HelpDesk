import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '../../generated/prisma/enums';
import type { RequisicaoAutenticada } from './autenticacao.tipos';
import { CHAVE_PAPEIS } from './papeis.decorador';

@Injectable()
export class GuardaPapeis implements CanActivate {
  constructor(private readonly refletor: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const papeisPermitidos = this.refletor.getAllAndOverride<Role[]>(
      CHAVE_PAPEIS,
      [contexto.getHandler(), contexto.getClass()],
    );

    if (!papeisPermitidos?.length) return true;

    const requisicao = contexto
      .switchToHttp()
      .getRequest<RequisicaoAutenticada>();

    return papeisPermitidos.includes(requisicao.user.role);
  }
}
