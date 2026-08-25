import { Module } from '@nestjs/common';
// Agrupa JWT, Passport e os componentes de autenticação.
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      // registerAsync lê as variáveis somente durante a inicialização do Nest.
      // O segredo assina e valida o token; nunca deve ser enviado ao frontend.
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (servicoConfiguracao: ConfigService) => ({
        secret: servicoConfiguracao.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: servicoConfiguracao.get('JWT_EXPIRES_IN', '8h'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  // JwtStrategy valida o token e RolesGuard aplica autorização por perfil.
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [JwtModule],
})
export class AuthModule {}
