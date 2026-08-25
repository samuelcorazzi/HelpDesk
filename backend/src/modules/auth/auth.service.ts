import { Injectable, UnauthorizedException } from '@nestjs/common';
// Valida credenciais, emite o JWT e registra auditoria de cada tentativa.
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './auth.dto';
import type { JwtPayload, ContextoTentativaLogin } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarios: UsersService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async entrar(dadosEntrada: LoginDto, contexto: ContextoTentativaLogin) {
    // A mesma resposta é usada em falhas distintas para não revelar contas válidas.
    // Internamente, porém, motivoFalha guarda a causa real para auditoria.
    const emailInformado = dadosEntrada.email.trim().toLowerCase();
    const usuario =
      await this.usuarios.buscarPorEmailParaAutenticacao(emailInformado);

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
      // compare aplica ao texto digitado os parâmetros contidos no próprio hash
      // e compara o resultado; a senha original nunca precisa ser recuperada.
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

    const conteudoToken: JwtPayload = {
      // "sub" (subject) é o campo padrão do JWT para identificar a conta.
      // O token carrega só os dados necessários à autenticação/autorização.
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
      // O cliente guardará accessToken e o enviará como Bearer nas próximas
      // requisições. A resposta pública exclui passwordHash de propósito.
      accessToken: await this.jwt.signAsync(conteudoToken),
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
    // Limita dados de contexto ao tamanho previsto no banco.
    // Este método também registra tentativas com e-mail inexistente; nesse caso
    // usuarioId fica nulo porque não há uma conta à qual criar a relação.
    return this.prisma.registroLogin.create({
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
