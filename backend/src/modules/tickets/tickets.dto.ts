// Os DTOs descrevem o que cada rota aceita e barram dados inválidos antes que eles
// cheguem às regras do service.
import { Transform } from 'class-transformer';
import { IsEnum, IsString, Length } from 'class-validator';
import { TicketStatus, Urgency } from '../../generated/prisma/enums';

export class CreateTicketDto {
  // Estes nomes são os mesmos usados no formulário de criação. Assim cada campo
  // enviado pelo frontend encontra diretamente sua validação no backend.
  @IsString()
  @Length(3, 150)
  assunto!: string;

  @IsString()
  @Length(10, 5000)
  descricao!: string;

  @IsEnum(Urgency)
  urgencia!: Urgency;
}

export class UpdateTicketStatusDto {
  // O status precisa ser um dos valores conhecidos pelo sistema. Um texto
  // inventado, como "FINALIZANDO", é rejeitado antes de chegar ao banco.
  @IsEnum(TicketStatus)
  status!: TicketStatus;
}

export class SendTicketMessageDto {
  // Primeiro retiramos os espaços das pontas e só depois validamos o tamanho. Com
  // isso, uma mensagem contendo apenas espaços é considerada vazia.
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 2000)
  conteudo!: string;
}
