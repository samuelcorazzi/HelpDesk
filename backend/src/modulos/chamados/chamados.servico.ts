import { Injectable, NotFoundException } from '@nestjs/common';
// Regras de negócio, autorização por dono do chamado e armazenamento de anexos.
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import { ServicoPrisma } from '../../infraestrutura/banco-de-dados/servico-prisma';
import { Prisma } from '../../generated/prisma/client';
import { Role, TicketStatus } from '../../generated/prisma/enums';
import type { UsuarioAutenticado } from '../autenticacao/autenticacao.tipos';
import { CriarChamadoDto, EnviarMensagemChamadoDto } from './chamados.dto';

const selecaoMensagemPublica = {
  id: true,
  conteudo: true,
  criadoEm: true,
  autor: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
} satisfies Prisma.MensagemChamadoSelect;

const selecaoChamadoPublico = {
  id: true,
  sequenceNumber: true,
  subject: true,
  description: true,
  urgency: true,
  status: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  attachments: {
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      size: true,
      createdAt: true,
    },
  },
} satisfies Prisma.TicketSelect;

const selecaoChamadoDetalhado = {
  ...selecaoChamadoPublico,
  mensagens: {
    orderBy: { criadoEm: 'asc' },
    select: selecaoMensagemPublica,
  },
} satisfies Prisma.TicketSelect;

@Injectable()
export class ServicoChamados {
  constructor(private readonly bancoDeDados: ServicoPrisma) {}

  async criar(
    usuario: UsuarioAutenticado,
    dadosChamado: CriarChamadoDto,
    anexo?: Express.Multer.File,
  ) {
    // Se a criação no banco falhar, remove o arquivo para não deixar lixo local.
    let caminhoAnexo: string | undefined;

    try {
      if (anexo) caminhoAnexo = await this.salvarAnexo(anexo);

      return await this.bancoDeDados.ticket.create({
        data: {
          subject: dadosChamado.assunto.trim(),
          description: dadosChamado.descricao.trim(),
          urgency: dadosChamado.urgencia,
          userId: usuario.id,
          attachments: anexo
            ? {
                create: {
                  fileName: anexo.originalname.slice(0, 255),
                  storagePath: this.obterCaminhoRelativo(
                    caminhoAnexo as string,
                  ),
                  mimeType: anexo.mimetype,
                  size: anexo.size,
                },
              }
            : undefined,
        },
        select: selecaoChamadoPublico,
      });
    } catch (erro) {
      if (caminhoAnexo) await unlink(caminhoAnexo).catch(() => undefined);
      throw erro;
    }
  }

  listar(usuario: UsuarioAutenticado) {
    // Administradores veem todos; usuários comuns veem somente os próprios.
    return this.bancoDeDados.ticket.findMany({
      where: usuario.role === Role.ADMIN ? undefined : { userId: usuario.id },
      orderBy: { createdAt: 'desc' },
      select: selecaoChamadoPublico,
    });
  }

  async buscarPorId(usuario: UsuarioAutenticado, identificador: string) {
    const chamado = await this.bancoDeDados.ticket.findFirst({
      where: {
        id: identificador,
        ...(usuario.role === Role.ADMIN ? {} : { userId: usuario.id }),
      },
      select: selecaoChamadoDetalhado,
    });

    if (!chamado) throw new NotFoundException('Chamado não encontrado.');
    return chamado;
  }

  async enviarMensagem(
    usuario: UsuarioAutenticado,
    identificador: string,
    dadosMensagem: EnviarMensagemChamadoDto,
  ) {
    const chamado = await this.bancoDeDados.ticket.findFirst({
      where: {
        id: identificador,
        ...(usuario.role === Role.ADMIN ? {} : { userId: usuario.id }),
      },
      select: { id: true },
    });

    if (!chamado) throw new NotFoundException('Chamado não encontrado.');

    const chamadoAtualizado = await this.bancoDeDados.ticket.update({
      where: { id: identificador },
      data: {
        mensagens: {
          create: {
            conteudo: dadosMensagem.conteudo,
            autorId: usuario.id,
          },
        },
      },
      select: {
        mensagens: {
          orderBy: { criadoEm: 'desc' },
          take: 1,
          select: selecaoMensagemPublica,
        },
      },
    });

    return chamadoAtualizado.mensagens[0];
  }

  async atualizarStatus(identificador: string, status: TicketStatus) {
    const chamado = await this.bancoDeDados.ticket.findUnique({
      where: { id: identificador },
      select: { id: true },
    });

    if (!chamado) throw new NotFoundException('Chamado não encontrado.');

    return this.bancoDeDados.ticket.update({
      where: { id: identificador },
      data: {
        status,
        resolvedAt: status === TicketStatus.RESOLVED ? new Date() : null,
      },
      select: selecaoChamadoPublico,
    });
  }

  async obterAnexo(
    usuario: UsuarioAutenticado,
    identificadorChamado: string,
    identificadorAnexo: string,
  ) {
    // A consulta une autorização e anexo, impedindo download por UUID adivinhado.
    const anexo = await this.bancoDeDados.attachment.findFirst({
      where: {
        id: identificadorAnexo,
        ticketId: identificadorChamado,
        ...(usuario.role === Role.ADMIN
          ? {}
          : { ticket: { userId: usuario.id } }),
      },
    });

    if (!anexo) throw new NotFoundException('Anexo não encontrado.');

    const caminhoAbsoluto = resolve(process.cwd(), anexo.storagePath);
    if (!existsSync(caminhoAbsoluto)) {
      throw new NotFoundException('O arquivo do anexo não foi encontrado.');
    }

    return { ...anexo, caminhoAbsoluto };
  }

  private obterCaminhoRelativo(caminhoAbsoluto: string) {
    return relative(process.cwd(), caminhoAbsoluto).replaceAll('\\', '/');
  }

  private async salvarAnexo(anexo: Express.Multer.File) {
    // UUID evita colisões e preserva somente a extensão do arquivo original.
    const pastaAnexos = join(process.cwd(), 'uploads', 'anexos');
    const nomeArmazenado = `${randomUUID()}${extname(anexo.originalname).toLowerCase()}`;
    const caminhoAnexo = join(pastaAnexos, nomeArmazenado);

    await mkdir(pastaAnexos, { recursive: true });
    await writeFile(caminhoAnexo, anexo.buffer);

    return caminhoAnexo;
  }
}
