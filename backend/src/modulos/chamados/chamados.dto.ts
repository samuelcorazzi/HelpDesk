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
