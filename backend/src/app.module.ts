import { Module } from '@nestjs/common';
// Módulo raiz que reúne configuração, banco e regras de negócio.
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // isGlobal evita importar ConfigModule separadamente em cada módulo.
      // .env.local tem prioridade porque aparece primeiro nesta lista.
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // A ordem abaixo descreve as grandes partes do backend. O módulo global do
    // banco fornece o Prisma; os demais registram os casos de uso do sistema.
    DatabaseModule,
    UsersModule,
    AuthModule,
    TicketsModule,
  ],
})
export class AppModule {}
