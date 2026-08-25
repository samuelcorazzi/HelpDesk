import { Global, Module } from '@nestjs/common';
// Disponibiliza uma única conexão Prisma para todos os módulos NestJS.
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
