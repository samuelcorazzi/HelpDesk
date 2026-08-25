import { Injectable } from '@nestjs/common';
// Guard reutilizável que aplica a estratégia JWT do Passport.
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
