import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { ServicoPrisma } from '../src/infraestrutura/banco-de-dados/servico-prisma';
import { Role } from '../src/generated/prisma/enums';
import { ModuloPrincipal } from '../src/modulo-principal';

interface RespostaEntradaTeste {
  accessToken: string;
  user: {
    email: string;
    role: Role;
  };
}

interface DadosRegistroLoginTeste {
  usuarioId?: string;
  emailInformado: string;
  sucesso: boolean;
  enderecoIp?: string;
  agenteUsuario?: string;
  motivoFalha?: string;
}

interface DadosCriacaoUsuarioTeste {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
}

interface ConsultaUsuarioTeste {
  where: {
    id?: string;
    email?: string;
  };
}

interface DadosCriacaoChamadoTeste {
  subject: string;
  description: string;
  urgency: string;
  userId: string;
  attachments?: {
    create: {
      fileName: string;
      storagePath: string;
      mimeType: string;
      size: number;
    };
  };
}

interface DadosMensagemChamadoTeste {
  conteudo: string;
  autorId: string;
}

interface DadosAtualizacaoChamadoTeste {
  status?: string;
  resolvedAt?: Date | null;
  mensagens?: {
    create: DadosMensagemChamadoTeste;
  };
}

describe('API HelpDesk (ponta a ponta)', () => {
  let aplicacao: INestApplication<App>;
  let senhaCriptografada: string;
  let criarRegistroLogin: jest.Mock;
  let criarUsuario: jest.Mock;
  let criarChamado: jest.Mock;
  let atualizarChamado: jest.Mock;
  let ultimoRegistroLogin: DadosRegistroLoginTeste | undefined;
  let ultimaCriacaoUsuario: DadosCriacaoUsuarioTeste | undefined;
  let ultimaCriacaoChamado: DadosCriacaoChamadoTeste | undefined;
  let ultimaAtualizacaoChamado:
    { status: string; resolvedAt: Date | null } | undefined;
  let ultimaMensagemChamado: DadosMensagemChamadoTeste | undefined;

  const usuarioAdministrador = {
    id: '7f35e7c4-6325-46bb-bf8e-9abb8f1b26fd',
    name: 'Administrador',
    email: 'admin@helpdesk.local',
    role: Role.ADMIN,
    active: true,
    createdAt: new Date('2026-08-16T00:00:00.000Z'),
    updatedAt: new Date('2026-08-16T00:00:00.000Z'),
  };

  const usuarioComum = {
    id: '8c2db917-613f-4c37-bb5d-f8b35ef71324',
    name: 'Usuário comum',
    email: 'usuario@helpdesk.local',
    role: Role.USER,
    active: true,
    createdAt: new Date('2026-08-17T00:00:00.000Z'),
    updatedAt: new Date('2026-08-17T00:00:00.000Z'),
  };

  beforeAll(async () => {
    senhaCriptografada = await bcrypt.hash('SenhaTeste123', 4);
  });

  beforeEach(async () => {
    process.env.JWT_SECRET = 'segredo-usado-apenas-nos-testes-automatizados';
    ultimoRegistroLogin = undefined;
    ultimaCriacaoUsuario = undefined;
    ultimaCriacaoChamado = undefined;
    ultimaAtualizacaoChamado = undefined;
    ultimaMensagemChamado = undefined;

    criarRegistroLogin = jest
      .fn()
      .mockImplementation(({ data }: { data: DadosRegistroLoginTeste }) => {
        ultimoRegistroLogin = data;
        return {
          id: '0d598735-703a-4a2a-82e9-88d59e80ecdf',
          ...data,
          criadoEm: new Date(),
        };
      });

    criarUsuario = jest
      .fn()
      .mockImplementation(({ data }: { data: DadosCriacaoUsuarioTeste }) => {
        ultimaCriacaoUsuario = data;
        return {
          id: '48fe0710-5bad-429d-86fc-99949de18018',
          name: data.name,
          email: data.email,
          role: data.role ?? Role.USER,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

    criarChamado = jest
      .fn()
      .mockImplementation(({ data }: { data: DadosCriacaoChamadoTeste }) => {
        ultimaCriacaoChamado = data;
        return {
          id: 'a25991c4-ce7a-4823-a795-a8ecbc3b313d',
          sequenceNumber: 1,
          subject: data.subject,
          description: data.description,
          urgency: data.urgency,
          status: 'OPEN',
          resolvedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          attachments: data.attachments
            ? [
                {
                  id: 'f22e751f-b223-488d-b7e7-9c358452cf57',
                  ...data.attachments.create,
                  createdAt: new Date(),
                },
              ]
            : [],
        };
      });

    atualizarChamado = jest
      .fn()
      .mockImplementation(
        ({ data }: { data: DadosAtualizacaoChamadoTeste }) => {
          if (data.mensagens) {
            ultimaMensagemChamado = data.mensagens.create;
            return {
              mensagens: [
                {
                  id: '941a4216-71a6-44cc-9be9-5b5723239469',
                  conteudo: data.mensagens.create.conteudo,
                  criadoEm: new Date(),
                  autor:
                    data.mensagens.create.autorId === usuarioAdministrador.id
                      ? usuarioAdministrador
                      : usuarioComum,
                },
              ],
            };
          }

          ultimaAtualizacaoChamado = {
            status: data.status ?? 'OPEN',
            resolvedAt: data.resolvedAt ?? null,
          };
          return {
            id: 'a25991c4-ce7a-4823-a795-a8ecbc3b313d',
            sequenceNumber: 1,
            subject: 'Computador sem acesso à rede',
            description:
              'O computador deixou de acessar a rede durante a manhã.',
            urgency: 'MEDIUM',
            status: data.status,
            resolvedAt: data.resolvedAt,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: usuarioComum,
            attachments: [],
          };
        },
      );

    const buscarUsuario = jest
      .fn()
      .mockImplementation(({ where }: ConsultaUsuarioTeste) => {
        if (
          where.email === usuarioAdministrador.email ||
          where.id === usuarioAdministrador.id
        ) {
          return {
            ...usuarioAdministrador,
            passwordHash: senhaCriptografada,
          };
        }

        if (
          where.email === usuarioComum.email ||
          where.id === usuarioComum.id
        ) {
          return {
            ...usuarioComum,
            passwordHash: senhaCriptografada,
          };
        }

        return null;
      });

    const moduloTeste: TestingModule = await Test.createTestingModule({
      imports: [ModuloPrincipal],
    })
      .overrideProvider(ServicoPrisma)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
        user: {
          findUnique: buscarUsuario,
          findMany: jest.fn().mockResolvedValue([usuarioAdministrador]),
          create: criarUsuario,
        },
        registroLogin: {
          create: criarRegistroLogin,
        },
        ticket: {
          create: criarChamado,
          findMany: jest.fn().mockResolvedValue([]),
          findFirst: jest.fn().mockResolvedValue({
            id: 'a25991c4-ce7a-4823-a795-a8ecbc3b313d',
          }),
          findUnique: jest.fn().mockResolvedValue({
            id: 'a25991c4-ce7a-4823-a795-a8ecbc3b313d',
          }),
          update: atualizarChamado,
        },
        attachment: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
      })
      .compile();

    aplicacao = moduloTeste.createNestApplication();
    aplicacao.setGlobalPrefix('api');
    aplicacao.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await aplicacao.init();
  });

  it('/api/auth/login permite entrar com dados válidos', async () => {
    const resposta = await request(aplicacao.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@helpdesk.local',
        password: 'SenhaTeste123',
      })
      .expect(200);
    const corpo = resposta.body as unknown as RespostaEntradaTeste;

    expect(corpo).toMatchObject({
      user: {
        email: 'admin@helpdesk.local',
        role: Role.ADMIN,
      },
    });
    expect(corpo.accessToken).toEqual(expect.any(String));
    expect(corpo.user).not.toHaveProperty('passwordHash');
    expect(ultimoRegistroLogin).toMatchObject({
      usuarioId: usuarioAdministrador.id,
      emailInformado: usuarioAdministrador.email,
      sucesso: true,
    });
    expect(ultimoRegistroLogin).not.toHaveProperty('password');
  });

  it('/api/auth/login rejeita e registra uma senha inválida', async () => {
    await request(aplicacao.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@helpdesk.local',
        password: 'SenhaErrada123',
      })
      .expect(401);

    expect(ultimoRegistroLogin).toMatchObject({
      sucesso: false,
      motivoFalha: 'SENHA_INVALIDA',
    });
  });

  it('/api/users exige autenticação', () => {
    return request(aplicacao.getHttpServer()).get('/api/users').expect(401);
  });

  it('/api/users permite acesso de um administrador autenticado', async () => {
    const respostaEntrada = await request(aplicacao.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@helpdesk.local',
        password: 'SenhaTeste123',
      })
      .expect(200);

    const corpoEntrada =
      respostaEntrada.body as unknown as RespostaEntradaTeste;

    return request(aplicacao.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${corpoEntrada.accessToken}`)
      .expect(200)
      .expect([
        {
          ...usuarioAdministrador,
          createdAt: usuarioAdministrador.createdAt.toISOString(),
          updatedAt: usuarioAdministrador.updatedAt.toISOString(),
        },
      ]);
  });

  it('/api/users permite que administrador cadastre senha criptografada', async () => {
    const respostaEntrada = await request(aplicacao.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: usuarioAdministrador.email,
        password: 'SenhaTeste123',
      })
      .expect(200);

    const corpoEntrada =
      respostaEntrada.body as unknown as RespostaEntradaTeste;

    await request(aplicacao.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${corpoEntrada.accessToken}`)
      .send({
        name: 'Novo usuário',
        email: 'novo@helpdesk.local',
        password: 'SenhaNova123',
        role: Role.USER,
      })
      .expect(201);

    const senhaSalva = ultimaCriacaoUsuario?.passwordHash;

    expect(senhaSalva).not.toBe('SenhaNova123');
    expect(senhaSalva).toEqual(expect.any(String));
    await expect(
      bcrypt.compare('SenhaNova123', senhaSalva ?? ''),
    ).resolves.toBe(true);
  });

  it('/api/users impede que usuário comum cadastre contas', async () => {
    const respostaEntrada = await request(aplicacao.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: usuarioComum.email,
        password: 'SenhaTeste123',
      })
      .expect(200);

    const corpoEntrada =
      respostaEntrada.body as unknown as RespostaEntradaTeste;

    await request(aplicacao.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${corpoEntrada.accessToken}`)
      .send({
        name: 'Conta indevida',
        email: 'indevido@helpdesk.local',
        password: 'SenhaNova123',
      })
      .expect(403);

    expect(criarUsuario).not.toHaveBeenCalled();
  });

  it('/api/chamados permite criar um chamado sem anexo', async () => {
    const respostaEntrada = await request(aplicacao.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: usuarioComum.email,
        password: 'SenhaTeste123',
      })
      .expect(200);

    const corpoEntrada =
      respostaEntrada.body as unknown as RespostaEntradaTeste;

    await request(aplicacao.getHttpServer())
      .post('/api/chamados')
      .set('Authorization', `Bearer ${corpoEntrada.accessToken}`)
      .field('assunto', 'Computador sem acesso à rede')
      .field(
        'descricao',
        'O computador deixou de acessar a rede durante a manhã.',
      )
      .field('urgencia', 'MEDIUM')
      .expect(201);

    expect(ultimaCriacaoChamado).toMatchObject({
      subject: 'Computador sem acesso à rede',
      urgency: 'MEDIUM',
      userId: usuarioComum.id,
    });
    expect(ultimaCriacaoChamado?.attachments).toBeUndefined();
  });

  it('/api/chamados aceita um anexo permitido', async () => {
    const respostaEntrada = await request(aplicacao.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: usuarioComum.email,
        password: 'SenhaTeste123',
      })
      .expect(200);

    const corpoEntrada =
      respostaEntrada.body as unknown as RespostaEntradaTeste;

    await request(aplicacao.getHttpServer())
      .post('/api/chamados')
      .set('Authorization', `Bearer ${corpoEntrada.accessToken}`)
      .field('assunto', 'Mensagem de erro no sistema')
      .field(
        'descricao',
        'Uma mensagem de erro aparece ao tentar concluir a operação.',
      )
      .field('urgencia', 'HIGH')
      .attach('anexo', Buffer.from('imagem usada apenas no teste'), {
        filename: 'erro.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(ultimaCriacaoChamado?.attachments?.create).toMatchObject({
      fileName: 'erro.png',
      mimeType: 'image/png',
    });
  });

  it('/api/chamados permite que administrador altere o status', async () => {
    const respostaEntrada = await request(aplicacao.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: usuarioAdministrador.email,
        password: 'SenhaTeste123',
      })
      .expect(200);

    const corpoEntrada =
      respostaEntrada.body as unknown as RespostaEntradaTeste;

    await request(aplicacao.getHttpServer())
      .patch('/api/chamados/a25991c4-ce7a-4823-a795-a8ecbc3b313d/status')
      .set('Authorization', `Bearer ${corpoEntrada.accessToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200)
      .expect((resposta) => {
        expect(resposta.body).toMatchObject({ status: 'IN_PROGRESS' });
      });

    expect(ultimaAtualizacaoChamado).toMatchObject({
      status: 'IN_PROGRESS',
      resolvedAt: null,
    });
  });

  it('/api/chamados impede usuário comum de alterar o status', async () => {
    const respostaEntrada = await request(aplicacao.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: usuarioComum.email,
        password: 'SenhaTeste123',
      })
      .expect(200);

    const corpoEntrada =
      respostaEntrada.body as unknown as RespostaEntradaTeste;

    await request(aplicacao.getHttpServer())
      .patch('/api/chamados/a25991c4-ce7a-4823-a795-a8ecbc3b313d/status')
      .set('Authorization', `Bearer ${corpoEntrada.accessToken}`)
      .send({ status: 'RESOLVED' })
      .expect(403);

    expect(atualizarChamado).not.toHaveBeenCalled();
  });

  it('/api/chamados permite que administrador responda ao chamado', async () => {
    const respostaEntrada = await request(aplicacao.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: usuarioAdministrador.email,
        password: 'SenhaTeste123',
      })
      .expect(200);

    const corpoEntrada =
      respostaEntrada.body as unknown as RespostaEntradaTeste;

    await request(aplicacao.getHttpServer())
      .post('/api/chamados/a25991c4-ce7a-4823-a795-a8ecbc3b313d/mensagens')
      .set('Authorization', `Bearer ${corpoEntrada.accessToken}`)
      .send({ conteudo: 'Estamos analisando o problema informado.' })
      .expect(201)
      .expect((resposta) => {
        expect(resposta.body).toMatchObject({
          conteudo: 'Estamos analisando o problema informado.',
          autor: { role: Role.ADMIN },
        });
      });

    expect(ultimaMensagemChamado).toEqual({
      conteudo: 'Estamos analisando o problema informado.',
      autorId: usuarioAdministrador.id,
    });
  });

  it('/api/chamados permite que o dono envie uma mensagem', async () => {
    const respostaEntrada = await request(aplicacao.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: usuarioComum.email,
        password: 'SenhaTeste123',
      })
      .expect(200);

    const corpoEntrada =
      respostaEntrada.body as unknown as RespostaEntradaTeste;

    await request(aplicacao.getHttpServer())
      .post('/api/chamados/a25991c4-ce7a-4823-a795-a8ecbc3b313d/mensagens')
      .set('Authorization', `Bearer ${corpoEntrada.accessToken}`)
      .send({ conteudo: 'Posso enviar mais informações se necessário.' })
      .expect(201);

    expect(ultimaMensagemChamado).toEqual({
      conteudo: 'Posso enviar mais informações se necessário.',
      autorId: usuarioComum.id,
    });
  });

  it('/api/chamados rejeita mensagem vazia', async () => {
    const respostaEntrada = await request(aplicacao.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: usuarioAdministrador.email,
        password: 'SenhaTeste123',
      })
      .expect(200);

    const corpoEntrada =
      respostaEntrada.body as unknown as RespostaEntradaTeste;

    await request(aplicacao.getHttpServer())
      .post('/api/chamados/a25991c4-ce7a-4823-a795-a8ecbc3b313d/mensagens')
      .set('Authorization', `Bearer ${corpoEntrada.accessToken}`)
      .send({ conteudo: '   ' })
      .expect(400);

    expect(ultimaMensagemChamado).toBeUndefined();
  });

  afterEach(async () => {
    const caminhoAnexo = ultimaCriacaoChamado?.attachments?.create.storagePath;
    if (caminhoAnexo) {
      await unlink(resolve(process.cwd(), caminhoAnexo)).catch(() => undefined);
    }
    if (aplicacao) await aplicacao.close();
  });
});
