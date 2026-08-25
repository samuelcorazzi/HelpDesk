import { Injectable, NotFoundException } from '@nestjs/common';
// Regras de negócio, autorização por dono do chamado e armazenamento de anexos.
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { Role, TicketStatus } from '../../generated/prisma/enums';
import type { UsuarioAutenticado } from '../auth/auth.types';
import { CreateTicketDto, SendTicketMessageDto } from './tickets.dto';

const selecaoMensagemPublica = {
  // Define exatamente o formato de uma mensagem devolvida à interface. O autor
  // aparece resumido e nenhum dado sensível da conta é carregado.
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
  // Seleção base usada em listas e mutações. Além do chamado, inclui o resumo do
  // solicitante e apenas os metadados necessários dos anexos.
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
  // A página de detalhes precisa também da conversa em ordem cronológica.
  ...selecaoChamadoPublico,
  mensagens: {
    orderBy: { criadoEm: 'asc' },
    select: selecaoMensagemPublica,
  },
} satisfies Prisma.TicketSelect;

@Injectable()
export class TicketsService {
  constructor(private readonly bancoDeDados: PrismaService) {}

  async criar(
    usuario: UsuarioAutenticado,
    dadosChamado: CreateTicketDto,
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
          // O dono vem do token validado, nunca de um userId enviado no formulário.
          userId: usuario.id,
          attachments: anexo
            ? {
                // Nested create grava Ticket e Attachment na mesma operação Prisma.
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
      // Compensa a gravação feita no sistema de arquivos caso o banco rejeite a
      // criação. Sem isso haveria anexos órfãos ocupando espaço.
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
    // Colocar a regra de propriedade dentro do WHERE evita buscar um registro e
    // só depois descobrir que o usuário não poderia vê-lo.
    const chamado = await this.bancoDeDados.ticket.findFirst({
      where: {
        id: identificador,
        ...(usuario.role === Role.ADMIN ? {} : { userId: usuario.id }),
      },
      select: selecaoChamadoDetalhado,
    });

    // O mesmo 404 cobre "não existe" e "não pertence ao usuário", sem revelar a
    // existência de chamados alheios.
    if (!chamado) throw new NotFoundException('Chamado não encontrado.');
    return chamado;
  }

  async enviarMensagem(
    usuario: UsuarioAutenticado,
    identificador: string,
    dadosMensagem: SendTicketMessageDto,
  ) {
    // A primeira consulta é também uma autorização: ADMIN encontra qualquer
    // chamado; USER encontra apenas um chamado que tenha o seu userId.
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
          // Criação aninhada liga a nova mensagem ao chamado e ao autor do token.
          create: {
            conteudo: dadosMensagem.conteudo,
            autorId: usuario.id,
          },
        },
      },
      select: {
        mensagens: {
          // Retorna só a mensagem recém-criada para o frontend acrescentá-la à tela.
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
        // Ao reabrir ou colocar em atendimento, a data de resolução volta a nulo.
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
    // O banco pode conter o metadado mesmo se alguém apagou o arquivo do disco.
    // Nesse caso a API responde 404 em vez de tentar abrir um caminho inexistente.
    if (!existsSync(caminhoAbsoluto)) {
      throw new NotFoundException('O arquivo do anexo não foi encontrado.');
    }

    return { ...anexo, caminhoAbsoluto };
  }

  private obterCaminhoRelativo(caminhoAbsoluto: string) {
    // Guardar caminho relativo permite mover a pasta inteira do projeto sem
    // invalidar os registros; a troca de barras mantém um formato uniforme.
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
