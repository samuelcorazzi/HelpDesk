// Esta configuração é usada pelo controller antes de entregar o anexo ao service.
// Ela limita o tamanho e aceita somente os formatos previstos pelo sistema.
import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';
import { extname } from 'node:path';

// O cálculo transforma 5 MB em bytes. O frontend usa o mesmo limite para avisar
// rápido, mas esta conferência é a que realmente impede um arquivo maior de entrar.
export const TAMANHO_MAXIMO_ANEXO = 5 * 1024 * 1024;

const tiposPermitidos = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const extensoesPermitidas = new Set(['.jpeg', '.jpg', '.pdf', '.png']);

export const configuracaoUploadAnexo = {
  // Como o limite é pequeno, o arquivo fica temporariamente na memória. Depois da
  // validação, o service grava esse conteúdo na pasta de anexos.
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

    // Conferimos tanto o tipo informado pelo arquivo quanto sua extensão. Assim um
    // executável apenas renomeado para ".pdf", por exemplo, não passa facilmente.
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

    // Esta é a resposta esperada pelo Multer: nenhum erro e arquivo aceito.
    concluir(null, true);
  },
};
