import { Transform } from 'class-transformer';
// Contratos validados para criação, mudança de status e mensagens do chamado.
import { IsEnum, IsString, Length } from 'class-validator';
import { TicketStatus, Urgency } from '../../generated/prisma/enums';

export class CreateTicketDto {
  // Os nomes em português correspondem exatamente aos atributos name do
  // formulário do frontend enviado em multipart/form-data.
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
  // @IsEnum impede gravar qualquer texto fora dos três estados do Prisma.
  @IsEnum(TicketStatus)
  status!: TicketStatus;
}

export class SendTicketMessageDto {
  // O Transform remove espaços nas pontas antes de @Length validar. Desse modo,
  // uma mensagem formada somente por espaços é tratada como vazia.
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 2000)
  conteudo!: string;
}
