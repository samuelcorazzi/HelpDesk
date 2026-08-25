// Aqui ficam as decisões do módulo: quem pode ver cada chamado, o que será salvo
// no banco e como os anexos serão guardados e recuperados.
import { Injectable, NotFoundException } from '@nestjs/common';
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
  // A conversa precisa mostrar quem escreveu, mas não precisa carregar a conta
  // inteira do autor. Por isso devolvemos somente nome e papel.
  id: true,
  conteudo: true,
  criadoEm: true,
  autor: {
    select: {
      name: true,
      role: true,
    },
  },
} satisfies Prisma.MensagemChamadoSelect;

const selecaoChamadoPublico = {
  // Este é o formato comum enviado para o frontend. Centralizar a seleção evita
  // que cada rota devolva campos diferentes ou informações que a tela não usa.
  id: true,
  sequenceNumber: true,
  subject: true,
  description: true,
  urgency: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      name: true,
      email: true,
    },
  },
  attachments: {
    select: {
      id: true,
      fileName: true,
      size: true,
    },
  },
} satisfies Prisma.TicketSelect;

const selecaoChamadoDetalhado = {
  // Na página de detalhes usamos os mesmos dados e acrescentamos a conversa,
  // organizada da mensagem mais antiga para a mais recente.
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
    // Guardamos o caminho porque o arquivo é salvo antes do registro no banco. Se
    // a criação falhar, esse caminho permite apagar o arquivo que ficou sobrando.
    let caminhoAnexo: string | undefined;

    try {
      if (anexo) caminhoAnexo = await this.salvarAnexo(anexo);

      return await this.bancoDeDados.ticket.create({
        data: {
          subject: dadosChamado.assunto.trim(),
          description: dadosChamado.descricao.trim(),
          urgency: dadosChamado.urgencia,
          // O dono do chamado é sempre o usuário identificado pelo token. Aceitar
          // esse ID do formulário permitiria abrir um chamado em nome de outra pessoa.
          userId: usuario.id,
          attachments: anexo
            ? {
                // O Prisma cria o chamado e já cadastra os dados do anexo ligados
                // a ele, sem precisar fazer uma segunda gravação separada.
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
      // Se o banco não aceitar o chamado, também desfazemos o salvamento do anexo.
      // Assim não ficam arquivos sem nenhum chamado correspondente.
      if (caminhoAnexo) await unlink(caminhoAnexo).catch(() => undefined);
      throw erro;
    }
  }

  listar(usuario: UsuarioAutenticado) {
    // A rota de listagem é a mesma para todos. O papel do usuário é que decide se
    // a consulta traz todos os chamados ou somente os que pertencem a ele.
    return this.bancoDeDados.ticket.findMany({
      where: usuario.role === Role.ADMIN ? undefined : { userId: usuario.id },
      orderBy: { createdAt: 'desc' },
      select: selecaoChamadoPublico,
    });
  }

  async buscarPorId(usuario: UsuarioAutenticado, identificador: string) {
    // Para usuários comuns, a própria busca exige que o chamado tenha o ID deles.
    // Dessa forma, um chamado de outra pessoa nem chega a ser devolvido pelo banco.
    const chamado = await this.bancoDeDados.ticket.findFirst({
      where: {
        id: identificador,
        ...(usuario.role === Role.ADMIN ? {} : { userId: usuario.id }),
      },
      select: selecaoChamadoDetalhado,
    });

    // Usamos a mesma resposta quando o chamado não existe ou pertence a outra
    // pessoa. Isso não entrega informações sobre chamados alheios.
    if (!chamado) throw new NotFoundException('Chamado não encontrado.');
    return chamado;
  }

  async enviarMensagem(
    usuario: UsuarioAutenticado,
    identificador: string,
    dadosMensagem: SendTicketMessageDto,
  ) {
    // Antes de salvar a mensagem, esta busca confirma o acesso: o administrador
    // encontra qualquer chamado, e o usuário comum encontra apenas os próprios.
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
          // A mensagem já nasce ligada ao chamado e ao autor identificado no token.
          create: {
            conteudo: dadosMensagem.conteudo,
            autorId: usuario.id,
          },
        },
      },
      select: {
        mensagens: {
          // O frontend precisa apenas da nova mensagem para colocá-la no fim da
          // conversa, então não buscamos todo o histórico novamente.
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
        // A data é preenchida ao resolver. Se o chamado voltar a ficar aberto ou
        // em atendimento, ela é limpa porque ele deixou de estar concluído.
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
    // Não basta conhecer o ID do arquivo: ele precisa pertencer ao chamado da URL,
    // e o usuário também precisa ter permissão para acessar esse chamado.
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
    // O registro pode continuar no banco mesmo se alguém apagar o arquivo da pasta.
    // Nesse caso devolvemos 404 em vez de iniciar um download que falharia depois.
    if (!existsSync(caminhoAbsoluto)) {
      throw new NotFoundException('O arquivo do anexo não foi encontrado.');
    }

    return { ...anexo, caminhoAbsoluto };
  }

  private obterCaminhoRelativo(caminhoAbsoluto: string) {
    // Salvamos somente o caminho a partir da pasta do backend. Assim o projeto pode
    // mudar de computador sem gravar no banco um endereço exclusivo desta máquina.
    return relative(process.cwd(), caminhoAbsoluto).replaceAll('\\', '/');
  }

  private async salvarAnexo(anexo: Express.Multer.File) {
    // Um nome aleatório evita que dois anexos chamados "erro.png" sobrescrevam um
    // ao outro. Mantemos apenas a extensão para reconhecer o formato do arquivo.
    const pastaAnexos = join(process.cwd(), 'uploads', 'anexos');
    const nomeArmazenado = `${randomUUID()}${extname(anexo.originalname).toLowerCase()}`;
    const caminhoAnexo = join(pastaAnexos, nomeArmazenado);

    await mkdir(pastaAnexos, { recursive: true });
    await writeFile(caminhoAnexo, anexo.buffer);

    return caminhoAnexo;
  }
}
