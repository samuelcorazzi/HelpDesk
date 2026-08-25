import { SetMetadata } from '@nestjs/common';
import type { Role } from '../../generated/prisma/enums';

export const ROLES_KEY = 'roles';

// Guarda na rota os tipos de usuário que podem acessá-la. A verificação dessa
// informação é feita em roles.guard.ts antes de o controller ser executado.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
