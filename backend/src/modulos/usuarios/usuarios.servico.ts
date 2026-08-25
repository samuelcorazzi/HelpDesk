import {
  // Regras de negócio de usuários; nunca devolve passwordHash nas respostas públicas.
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ServicoPrisma } from '../../infraestrutura/banco-de-dados/servico-prisma';
import { Prisma } from '../../generated/prisma/client';
import { AtualizarUsuarioDto, CriarUsuarioDto } from './usuarios.dto';

export const selecaoUsuarioPublico = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class ServicoUsuarios {
  constructor(private readonly bancoDeDados: ServicoPrisma) {}

  async criar(dadosUsuario: CriarUsuarioDto) {
    // Normaliza e verifica o e-mail antes de calcular o hash da senha.
    const emailNormalizado = this.normalizarEmail(dadosUsuario.email);
    await this.garantirEmailDisponivel(emailNormalizado);

    return this.bancoDeDados.user.create({
      data: {
        name: dadosUsuario.name.trim(),
        email: emailNormalizado,
        passwordHash: await bcrypt.hash(dadosUsuario.password, 12),
        role: dadosUsuario.role,
      },
      select: selecaoUsuarioPublico,
    });
  }

  listarTodos() {
    return this.bancoDeDados.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: selecaoUsuarioPublico,
    });
  }

  async buscarPorId(identificador: string) {
    const usuario = await this.bancoDeDados.user.findUnique({
      where: { id: identificador },
      select: selecaoUsuarioPublico,
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return usuario;
  }

  buscarPorEmailParaAutenticacao(email: string) {
    return this.bancoDeDados.user.findUnique({
      where: { email: this.normalizarEmail(email) },
    });
  }

  buscarPorIdParaAutenticacao(identificador: string) {
    return this.bancoDeDados.user.findUnique({
      where: { id: identificador },
      select: selecaoUsuarioPublico,
    });
  }

  async atualizar(identificador: string, dadosUsuario: AtualizarUsuarioDto) {
    const usuarioAtual = await this.buscarPorId(identificador);
    const dadosAtualizacao: Prisma.UserUpdateInput = {};

    if (dadosUsuario.name !== undefined) {
      dadosAtualizacao.name = dadosUsuario.name.trim();
    }

    if (dadosUsuario.role !== undefined) {
      dadosAtualizacao.role = dadosUsuario.role;
    }

    if (dadosUsuario.password !== undefined) {
      dadosAtualizacao.passwordHash = await bcrypt.hash(
        dadosUsuario.password,
        12,
      );
    }

    if (dadosUsuario.email !== undefined) {
      const emailNormalizado = this.normalizarEmail(dadosUsuario.email);

      if (emailNormalizado !== usuarioAtual.email) {
        await this.garantirEmailDisponivel(emailNormalizado);
      }

      dadosAtualizacao.email = emailNormalizado;
    }

    return this.bancoDeDados.user.update({
      where: { id: identificador },
      data: dadosAtualizacao,
      select: selecaoUsuarioPublico,
    });
  }

  async atualizarStatus(identificador: string, estaAtivo: boolean) {
    await this.buscarPorId(identificador);

    return this.bancoDeDados.user.update({
      where: { id: identificador },
      data: { active: estaAtivo },
      select: selecaoUsuarioPublico,
    });
  }

  private normalizarEmail(email: string) {
    // Mantém e-mails equivalentes com a mesma representação no banco.
    return email.trim().toLowerCase();
  }

  private async garantirEmailDisponivel(email: string) {
    const usuarioExistente = await this.bancoDeDados.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (usuarioExistente) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }
  }
}
