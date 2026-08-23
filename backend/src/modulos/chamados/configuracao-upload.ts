import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';
import { extname } from 'node:path';

export const TAMANHO_MAXIMO_ANEXO = 5 * 1024 * 1024;

const tiposPermitidos = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const extensoesPermitidas = new Set(['.jpeg', '.jpg', '.pdf', '.png']);

export const configuracaoUploadAnexo = {
  storage: memoryStorage(),
  limits: {
    fileSize: TAMANHO_MAXIMO_ANEXO,
    files: 1,
  },
  fileFilter: (
    _requisicao: Express.Request,
    arquivo: Express.Multer.File,
    concluir: (erro: Error | null, aceitarArquivo: boolean) => void,
  ) => {
    const extensao = extname(arquivo.originalname).toLowerCase();

    if (
      !tiposPermitidos.has(arquivo.mimetype) ||
      !extensoesPermitidas.has(extensao)
    ) {
      concluir(
        new BadRequestException('O anexo deve ser PNG, JPG ou PDF.'),
        false,
      );
      return;
    }

    concluir(null, true);
  },
};
