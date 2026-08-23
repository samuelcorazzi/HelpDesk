import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ServicoPrisma } from '../../infraestrutura/banco-de-dados/servico-prisma';
import { ServicoUsuarios } from '../usuarios/usuarios.servico';
import { DadosEntradaDto } from './autenticacao.dto';
import type {
  ConteudoTokenJwt,
  ContextoTentativaLogin,
} from './autenticacao.tipos';

@Injectable()
export class ServicoAutenticacao {
  constructor(
    private readonly servicoUsuarios: ServicoUsuarios,
    private readonly servicoJwt: JwtService,
    private readonly bancoDeDados: ServicoPrisma,
  ) {}

  async entrar(
    dadosEntrada: DadosEntradaDto,
    contexto: ContextoTentativaLogin,
  ) {
    const emailInformado = dadosEntrada.email.trim().toLowerCase();
    const usuario =
      await this.servicoUsuarios.buscarPorEmailParaAutenticacao(emailInformado);

    if (!usuario) {
      await this.registrarTentativaLogin({
        emailInformado,
        sucesso: false,
        motivoFalha: 'USUARIO_NAO_ENCONTRADO',
        contexto,
      });
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    if (!usuario.active) {
      await this.registrarTentativaLogin({
        usuarioId: usuario.id,
        emailInformado,
        sucesso: false,
        motivoFalha: 'USUARIO_DESATIVADO',
        contexto,
      });
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const senhaCorresponde = await bcrypt.compare(
      dadosEntrada.password,
      usuario.passwordHash,
    );

    if (!senhaCorresponde) {
      await this.registrarTentativaLogin({
        usuarioId: usuario.id,
        emailInformado,
        sucesso: false,
        motivoFalha: 'SENHA_INVALIDA',
        contexto,
      });
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const conteudoToken: ConteudoTokenJwt = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
    };

    await this.registrarTentativaLogin({
      usuarioId: usuario.id,
      emailInformado,
      sucesso: true,
      contexto,
    });

    return {
      accessToken: await this.servicoJwt.signAsync(conteudoToken),
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        active: usuario.active,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
      },
    };
  }

  private registrarTentativaLogin({
    usuarioId,
    emailInformado,
    sucesso,
    motivoFalha,
    contexto,
  }: {
    usuarioId?: string;
    emailInformado: string;
    sucesso: boolean;
    motivoFalha?: string;
    contexto: ContextoTentativaLogin;
  }) {
    return this.bancoDeDados.registroLogin.create({
      data: {
        usuarioId,
        emailInformado,
        sucesso,
        motivoFalha,
        enderecoIp: contexto.enderecoIp?.slice(0, 64),
        agenteUsuario: contexto.agenteUsuario?.slice(0, 500),
      },
    });
  }
}
