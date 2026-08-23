import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ModuloUsuarios } from '../usuarios/usuarios.modulo';
import { ControladorAutenticacao } from './autenticacao.controlador';
import { ServicoAutenticacao } from './autenticacao.servico';
import { EstrategiaJwt } from './estrategia-jwt';
import { GuardaPapeis } from './guarda-papeis';

@Module({
  imports: [
    ConfigModule,
    ModuloUsuarios,
    PassportModule,
    JwtModule.registerAsync({
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
  controllers: [ControladorAutenticacao],
  providers: [ServicoAutenticacao, EstrategiaJwt, GuardaPapeis],
  exports: [JwtModule],
})
export class ModuloAutenticacao {}
