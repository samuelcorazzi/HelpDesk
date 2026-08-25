import { BadRequestException } from '@nestjs/common';
// Política de upload: arquivo em memória, um anexo e tipos explicitamente permitidos.
import { memoryStorage } from 'multer';
import { extname } from 'node:path';

// 5 MiB expressos em bytes. O mesmo limite também aparece no frontend para dar
// retorno rápido, mas a validação do backend é a que garante a segurança.
export const TAMANHO_MAXIMO_ANEXO = 5 * 1024 * 1024;

const tiposPermitidos = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const extensoesPermitidas = new Set(['.jpeg', '.jpg', '.pdf', '.png']);

export const configuracaoUploadAnexo = {
  // memoryStorage mantém o arquivo em anexo.buffer até o serviço decidir onde
  // persistir. É simples para arquivos pequenos, mas não convém para arquivos enormes.
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

    // MIME e extensão precisam concordar com as listas permitidas. Isso reduz
    // uploads acidentais de executáveis renomeados, embora inspeção do conteúdo
    // seja uma evolução recomendável para um ambiente de produção.
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

    // No padrão de callbacks do Multer: null significa "sem erro" e true aceita.
    concluir(null, true);
  },
};
