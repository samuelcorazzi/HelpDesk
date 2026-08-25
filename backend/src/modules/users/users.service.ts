import {
  // Regras de negócio de usuários; nunca devolve passwordHash nas respostas públicas.
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { CreateUserDto } from './users.dto';

export const selecaoUsuarioPublico = {
  // Este objeto é reutilizado em todas as consultas públicas. Uma lista de
  // campos permitidos é mais segura que buscar tudo e apagar a senha depois.
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly bancoDeDados: PrismaService) {}

  async criar(dadosUsuario: CreateUserDto) {
    // Normaliza e verifica o e-mail antes de calcular o hash da senha.
    const emailNormalizado = this.normalizarEmail(dadosUsuario.email);
    await this.garantirEmailDisponivel(emailNormalizado);

    return this.bancoDeDados.user.create({
      data: {
        name: dadosUsuario.name.trim(),
        email: emailNormalizado,
        // O custo 12 torna cada tentativa de hash propositalmente cara, o que
        // dificulta ataques de força bruta caso o banco seja comprometido.
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
    // Exceção consciente à seleção pública: o login precisa de passwordHash
    // para executar bcrypt.compare. Este retorno não sai diretamente pela API.
    return this.bancoDeDados.user.findUnique({
      where: { email: this.normalizarEmail(email) },
    });
  }

  buscarPorIdParaAutenticacao(identificador: string) {
    // Usado pela estratégia JWT para confirmar que a conta ainda existe/está
    // ativa; não há necessidade de carregar o hash da senha nesta consulta.
    return this.bancoDeDados.user.findUnique({
      where: { id: identificador },
      select: selecaoUsuarioPublico,
    });
  }

  private normalizarEmail(email: string) {
    // Mantém e-mails equivalentes com a mesma representação no banco.
    return email.trim().toLowerCase();
  }

  private async garantirEmailDisponivel(email: string) {
    // A restrição @unique no banco continua sendo a proteção definitiva; esta
    // checagem antecipada serve para devolver um erro de domínio compreensível.
    const usuarioExistente = await this.bancoDeDados.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (usuarioExistente) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }
  }
}
