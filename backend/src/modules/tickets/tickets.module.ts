import { Module } from '@nestjs/common';
// Agrupa a API e as regras de negócio dos chamados.
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
