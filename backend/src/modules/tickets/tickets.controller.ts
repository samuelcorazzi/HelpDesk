// O controller é a porta de entrada dos chamados: recebe a requisição, organiza
// os dados e chama o service, onde ficam as regras do sistema.
import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'node:fs';
import type { Response } from 'express';
import { Role } from '../../generated/prisma/enums';
import type { RequisicaoAutenticada } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateTicketDto,
  SendTicketMessageDto,
  UpdateTicketStatusDto,
} from './tickets.dto';
import { TicketsService } from './tickets.service';
import { configuracaoUploadAnexo } from './upload.config';

@Controller('chamados')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  // Como o JwtAuthGuard está na classe, ninguém acessa estas rotas sem login.
  // Quando uma ação exige algo a mais, como ser administrador, ela avisa no método.
  constructor(private readonly servicoChamados: TicketsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('anexo', configuracaoUploadAnexo))
  criar(
    @Req() requisicao: RequisicaoAutenticada,
    @UploadedFile() anexo: Express.Multer.File | undefined,
    @Body() dadosChamado: CreateTicketDto,
  ) {
    // O interceptor separa o anexo dos campos de texto. Depois disso, o DTO valida
    // assunto, descrição e urgência antes de o service tentar criar o chamado.
    return this.servicoChamados.criar(requisicao.user, dadosChamado, anexo);
  }

  @Get()
  listar(@Req() requisicao: RequisicaoAutenticada) {
    return this.servicoChamados.listar(requisicao.user);
  }

  @Get(':id')
  buscarPorId(
    @Req() requisicao: RequisicaoAutenticada,
    @Param('id', new ParseUUIDPipe()) identificador: string,
  ) {
    // Esta validação evita consultar o banco quando o ID da URL nem sequer tem o
    // formato usado pelos chamados.
    return this.servicoChamados.buscarPorId(requisicao.user, identificador);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  atualizarStatus(
    @Param('id', new ParseUUIDPipe()) identificador: string,
    @Body() dadosStatus: UpdateTicketStatusDto,
  ) {
    // Ver os próprios chamados exige apenas login. Alterar o andamento deles é uma
    // ação administrativa, por isso esta rota também passa pelo RolesGuard.
    return this.servicoChamados.atualizarStatus(
      identificador,
      dadosStatus.status,
    );
  }

  @Post(':id/mensagens')
  enviarMensagem(
    @Req() requisicao: RequisicaoAutenticada,
    @Param('id', new ParseUUIDPipe()) identificador: string,
    @Body() dadosMensagem: SendTicketMessageDto,
  ) {
    return this.servicoChamados.enviarMensagem(
      requisicao.user,
      identificador,
      dadosMensagem,
    );
  }

  @Get(':id/anexos/:anexoId')
  @Header('Cache-Control', 'private, max-age=3600')
  async baixarAnexo(
    @Req() requisicao: RequisicaoAutenticada,
    @Param('id', new ParseUUIDPipe()) identificadorChamado: string,
    @Param('anexoId', new ParseUUIDPipe()) identificadorAnexo: string,
    @Res({ passthrough: true }) resposta: Response,
  ) {
    // Antes de iniciar o download, o service confirma se o anexo existe e se este
    // usuário pode acessar o chamado ao qual ele pertence.
    const anexo = await this.servicoChamados.obterAnexo(
      requisicao.user,
      identificadorChamado,
      identificadorAnexo,
    );

    resposta.setHeader('Content-Type', anexo.mimeType);
    // Este cabeçalho pede ao navegador para baixar o arquivo e mantém o nome
    // original, inclusive quando ele possui acentos.
    resposta.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(anexo.fileName)}`,
    );

    // O arquivo é enviado aos poucos. Assim a API não precisa carregá-lo inteiro
    // na memória antes de começar o download.
    return new StreamableFile(createReadStream(anexo.caminhoAbsoluto));
  }
}
