import * as bcrypt from 'bcrypt';
// Script manual e idempotente para criar ou atualizar o primeiro administrador.
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client';
import { Role } from '../src/generated/prisma/enums';

config({ path: ['.env.local', '.env'], quiet: true });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
// Para tarefas administrativas, a conexão de sessão é preferida ao pooler de
// transações, mas DATABASE_URL continua disponível como alternativa.

if (!connectionString) {
  throw new Error('Defina DIRECT_URL ou DATABASE_URL no arquivo backend/.env.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function createInitialAdmin() {
  const name = process.env.INITIAL_ADMIN_NAME?.trim();
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      'Defina INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD no backend/.env.',
    );
  }

  if (password.length < 8 || password.length > 72) {
    throw new Error('A senha inicial deve possuir entre 8 e 72 caracteres.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // upsert torna o script idempotente: cria se o e-mail ainda não existe e
  // atualiza a mesma conta nas execuções seguintes, sem gerar duplicatas.
  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: Role.ADMIN,
      active: true,
    },
    create: {
      name,
      email,
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`Administrador inicial preparado: ${email}`);
}

createInitialAdmin()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Scripts independentes não têm o ciclo de vida do NestJS; precisam fechar o
    // Prisma explicitamente para que o processo termine e devolva o terminal.
    await prisma.$disconnect();
  });
