import {
  // Rotas autenticadas para abrir, consultar, atender e baixar chamados.
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
  // Todas as rotas desta classe exigem login. Restrições adicionais, como ser
  // ADMIN para alterar status, são declaradas diretamente no método.
  constructor(private readonly servicoChamados: TicketsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('anexo', configuracaoUploadAnexo))
  criar(
    @Req() requisicao: RequisicaoAutenticada,
    @UploadedFile() anexo: Express.Multer.File | undefined,
    @Body() dadosChamado: CreateTicketDto,
  ) {
    // FileInterceptor separa o arquivo do multipart/form-data; os demais campos
    // seguem para CreateTicketDto e são validados normalmente.
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
    // ParseUUIDPipe rejeita um id malformado antes de consultar o banco.
    return this.servicoChamados.buscarPorId(requisicao.user, identificador);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  atualizarStatus(
    @Param('id', new ParseUUIDPipe()) identificador: string,
    @Body() dadosStatus: UpdateTicketStatusDto,
  ) {
    // Embora todo usuário autenticado possa ver seus chamados, somente ADMIN
    // chega a esta operação de mudança de estado.
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
    // O serviço confirma simultaneamente a existência e a permissão de acesso.
    // Só depois disso o controlador cria o fluxo de download do arquivo.
    const anexo = await this.servicoChamados.obterAnexo(
      requisicao.user,
      identificadorChamado,
      identificadorAnexo,
    );

    resposta.setHeader('Content-Type', anexo.mimeType);
    // "attachment" orienta o navegador a baixar em vez de exibir; filename*
    // preserva acentos e outros caracteres UTF-8 no nome original.
    resposta.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(anexo.fileName)}`,
    );

    // Stream evita carregar o arquivo inteiro novamente na memória da API.
    return new StreamableFile(createReadStream(anexo.caminhoAbsoluto));
  }
}
