import { SetMetadata } from '@nestjs/common';
// Decorator que declara quais papéis podem executar uma rota.
import type { Role } from '../../generated/prisma/enums';

export const CHAVE_PAPEIS = 'papeis';
export const PapeisPermitidos = (...papeis: Role[]) =>
  SetMetadata(CHAVE_PAPEIS, papeis);
