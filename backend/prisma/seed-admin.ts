import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client';
import { Role } from '../src/generated/prisma/enums';

config({ path: ['.env.local', '.env'], quiet: true });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

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
    await prisma.$disconnect();
  });
