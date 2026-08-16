import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';
import { Role } from './../src/generated/prisma/enums';

interface LoginTestResponse {
  accessToken: string;
  user: {
    email: string;
    role: Role;
  };
}

describe('HelpDesk API (e2e)', () => {
  let app: INestApplication<App>;
  let passwordHash: string;

  const adminUser = {
    id: '7f35e7c4-6325-46bb-bf8e-9abb8f1b26fd',
    name: 'Administrador',
    email: 'admin@helpdesk.local',
    role: Role.ADMIN,
    active: true,
    createdAt: new Date('2026-08-16T00:00:00.000Z'),
    updatedAt: new Date('2026-08-16T00:00:00.000Z'),
  };

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('SenhaTeste123', 4);
  });

  beforeEach(async () => {
    process.env.JWT_SECRET = 'segredo-usado-apenas-nos-testes-automatizados';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
        user: {
          findUnique: jest.fn().mockResolvedValue({
            ...adminUser,
            passwordHash,
          }),
          findMany: jest.fn().mockResolvedValue([adminUser]),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  it('/api/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@helpdesk.local',
        password: 'SenhaTeste123',
      })
      .expect(200);
    const body = response.body as unknown as LoginTestResponse;

    expect(body).toMatchObject({
      user: {
        email: 'admin@helpdesk.local',
        role: Role.ADMIN,
      },
    });
    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.user).not.toHaveProperty('passwordHash');
  });

  it('/api/auth/login rejects an invalid password', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@helpdesk.local',
        password: 'SenhaErrada123',
      })
      .expect(401);
  });

  it('/api/users requires authentication', () => {
    return request(app.getHttpServer()).get('/api/users').expect(401);
  });

  it('/api/users allows an authenticated administrator', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@helpdesk.local',
        password: 'SenhaTeste123',
      })
      .expect(200);

    const loginBody = loginResponse.body as unknown as LoginTestResponse;

    return request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${loginBody.accessToken}`)
      .expect(200)
      .expect([
        {
          ...adminUser,
          createdAt: adminUser.createdAt.toISOString(),
          updatedAt: adminUser.updatedAt.toISOString(),
        },
      ]);
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          status: 'ok',
          service: 'helpdesk-api',
        });
      });
  });

  afterEach(async () => {
    if (app) await app.close();
  });
});
