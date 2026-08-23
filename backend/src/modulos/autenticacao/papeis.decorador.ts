import { SetMetadata } from '@nestjs/common';
import type { Role } from '../../generated/prisma/enums';

export const CHAVE_PAPEIS = 'papeis';
export const PapeisPermitidos = (...papeis: Role[]) =>
  SetMetadata(CHAVE_PAPEIS, papeis);
