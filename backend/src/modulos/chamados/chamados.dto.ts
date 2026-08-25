import { Transform } from 'class-transformer';
// Contratos validados para criação, mudança de status e mensagens do chamado.
import { IsEnum, IsString, Length } from 'class-validator';
import { TicketStatus, Urgency } from '../../generated/prisma/enums';

export class CriarChamadoDto {
  @IsString()
  @Length(3, 150)
  assunto!: string;

  @IsString()
  @Length(10, 5000)
  descricao!: string;

  @IsEnum(Urgency)
  urgencia!: Urgency;
}

export class AtualizarStatusChamadoDto {
  @IsEnum(TicketStatus)
  status!: TicketStatus;
}

export class EnviarMensagemChamadoDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 2000)
  conteudo!: string;
}
