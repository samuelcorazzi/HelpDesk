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
import type { RequisicaoAutenticada } from '../autenticacao/autenticacao.tipos';
import { GuardaAutenticacaoJwt } from '../autenticacao/guarda-autenticacao-jwt';
import { GuardaPapeis } from '../autenticacao/guarda-papeis';
import { PapeisPermitidos } from '../autenticacao/papeis.decorador';
import {
  AtualizarStatusChamadoDto,
  CriarChamadoDto,
  EnviarMensagemChamadoDto,
} from './chamados.dto';
import { ServicoChamados } from './chamados.servico';
import { configuracaoUploadAnexo } from './configuracao-upload';

@Controller('chamados')
@UseGuards(GuardaAutenticacaoJwt)
export class ControladorChamados {
  constructor(private readonly servicoChamados: ServicoChamados) {}

  @Post()
  @UseInterceptors(FileInterceptor('anexo', configuracaoUploadAnexo))
  criar(
    @Req() requisicao: RequisicaoAutenticada,
    @UploadedFile() anexo: Express.Multer.File | undefined,
    @Body() dadosChamado: CriarChamadoDto,
  ) {
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
    return this.servicoChamados.buscarPorId(requisicao.user, identificador);
  }

  @Patch(':id/status')
  @UseGuards(GuardaPapeis)
  @PapeisPermitidos(Role.ADMIN)
  atualizarStatus(
    @Param('id', new ParseUUIDPipe()) identificador: string,
    @Body() dadosStatus: AtualizarStatusChamadoDto,
  ) {
    return this.servicoChamados.atualizarStatus(
      identificador,
      dadosStatus.status,
    );
  }

  @Post(':id/mensagens')
  enviarMensagem(
    @Req() requisicao: RequisicaoAutenticada,
    @Param('id', new ParseUUIDPipe()) identificador: string,
    @Body() dadosMensagem: EnviarMensagemChamadoDto,
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
    const anexo = await this.servicoChamados.obterAnexo(
      requisicao.user,
      identificadorChamado,
      identificadorAnexo,
    );

    resposta.setHeader('Content-Type', anexo.mimeType);
    resposta.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(anexo.fileName)}`,
    );

    return new StreamableFile(createReadStream(anexo.caminhoAbsoluto));
  }
}
