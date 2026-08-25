import type { Request } from 'express';
// Tipos compartilhados pelo token JWT, guards e controladores protegidos.
import type { Role } from '../../generated/prisma/enums';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface UsuarioAutenticado {
  id: string;
  email: string;
  role: Role;
}

export interface RequisicaoAutenticada extends Request {
  user: UsuarioAutenticado;
}

export interface ContextoTentativaLogin {
  enderecoIp?: string;
  agenteUsuario?: string;
}
