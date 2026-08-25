# Sistema HelpDesk

Projeto acadêmico para abertura, acompanhamento e gerenciamento de chamados de suporte. Usuários poderão registrar solicitações e acompanhar seus protocolos; administradores poderão gerenciar usuários, alterar o status dos chamados e visualizar indicadores.

> Entrega prevista: **25 de agosto de 2026**.

## Estado atual

O repositório contém uma fundação funcional, autenticação JWT, auditoria de login, gerenciamento administrativo de usuários e o fluxo do usuário para criar e acompanhar chamados.

| Item                                 | Estado                      |
| ------------------------------------ | --------------------------- |
| Projeto NestJS                       | Pronto                      |
| PostgreSQL no Supabase               | Conectado                   |
| Schema e migration inicial do Prisma | Prontos                     |
| Prisma Client no NestJS              | Configurado                 |
| Projeto Next.js com TypeScript       | Pronto                      |
| Páginas visuais iniciais             | Prontas como estrutura      |
| Autenticação JWT                     | Pronta                      |
| Cadastro e listagem de usuários      | Prontos                     |
| Login do frontend                    | Conectado à API             |
| Auditoria de tentativas de login     | Pronta no banco             |
| Criação, listagem e detalhes         | Prontos                     |
| Operação administrativa dos chamados | Pronta                      |
| Conversa entre usuário e admin       | Pronta no banco e na API    |
| Anexo opcional local                 | Pronto para desenvolvimento |
| Upload no Supabase Storage           | Pendente                    |

## Funcionalidades planejadas

### Usuário

- Entrar com e-mail e senha.
- Visualizar os próprios chamados.
- Separar chamados abertos e resolvidos.
- Abrir chamado com assunto, descrição, urgência e anexo.
- Receber um número de protocolo automático.
- Acompanhar o status do chamado.

### Administrador

- Entrar em uma área administrativa.
- Criar, listar, editar e desativar usuários.
- Visualizar todos os chamados.
- Alterar o status entre aberto, em atendimento e resolvido.
- Visualizar e baixar anexos.
- Acompanhar indicadores do sistema.

## Tecnologias

### Frontend

- Next.js 16
- React 19
- TypeScript
- Pages Router

### Backend

- Node.js
- NestJS 11
- TypeScript
- API REST

### Dados

- PostgreSQL no Supabase
- Prisma ORM 7
- Supabase Storage para anexos, a ser configurado

## Arquitetura

```text
Navegador
   │
   ▼
Next.js :3002
   │ requisições HTTP
   ▼
NestJS :3001/api
   │
   ├── Prisma ──────────► PostgreSQL no Supabase
   ├── uploads/anexos ─────────► anexos locais no desenvolvimento
   └── Supabase Storage ───────► anexos compartilhados (etapa futura)
```

O frontend nunca deve receber a senha do PostgreSQL, `DIRECT_URL`, `DATABASE_URL` ou chaves secretas do Supabase. Toda consulta ao banco passa pelo backend.

## Estrutura do projeto

```text
HelpDesk-main/
├── backend/                         # API NestJS
│   ├── prisma/
│   │   ├── migrations/              # Histórico versionado do banco
│   │   └── schema.prisma            # Modelos User, Ticket e Attachment
│   ├── src/
│   │   ├── infrastructure/          # Integrações externas e banco de dados
│   │   ├── modules/                 # Autenticação, usuários e chamados
│   │   ├── generated/prisma/        # Gerado automaticamente; não vai ao Git
│   │   ├── app.module.ts             # Módulo raiz
│   │   └── main.ts                  # Inicialização, CORS e porta
│   ├── .env.example                 # Modelo de configuração sem segredos
│   ├── package.json
│   └── prisma.config.ts
│
├── frontend/                        # Aplicação Next.js
│   ├── src/
│   │   ├── components/              # Cabeçalho e componentes compartilhados
│   │   ├── lib/                     # Cliente da API e tipos compartilhados
│   │   ├── pages/                   # Rotas do Pages Router
│   │   └── globals.css              # Estilos globais
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore                       # Protege segredos e arquivos gerados
└── README.md
```

## Pré-requisitos

- Node.js 20 ou superior.
- npm.
- Git.
- Projeto criado no Supabase.
- Visual Studio Code, recomendado.

Confira as versões:

```powershell
node --version
npm --version
git --version
```

## Inicialização automática no Windows

Depois que o arquivo `backend/.env` estiver configurado, abra o CMD na raiz do projeto e execute:

```cmd
iniciar.cmd
```

O inicializador automaticamente:

1. Confere o Node.js e o npm.
2. Instala ou atualiza as dependências do backend e frontend.
3. Gera o Prisma Client.
4. Abre o projeto no VS Code.
5. Inicia o NestJS na porta `3001`.
6. Inicia o Next.js na porta `3002`.
7. Abre a tela de login no navegador.

Para encerrar os dois servidores:

```cmd
parar.cmd
```

## Configuração inicial

### 1. Clonar e entrar no projeto

```powershell
git clone https://github.com/samuelcorazzi/HelpDesk.git
Set-Location HelpDesk
```

### 2. Configurar o backend

```powershell
Set-Location backend
npm.cmd install
Copy-Item .env.example .env
```

Abra `backend/.env` e substitua os exemplos pelas conexões do Supabase:

```env
PORT=3001
FRONTEND_URL=http://localhost:3002
JWT_SECRET="UMA_CHAVE_LONGA_E_ALEATORIA"
JWT_EXPIRES_IN="8h"
DATABASE_URL="CONEXAO_TRANSACTION_POOLER_DO_SUPABASE"
DIRECT_URL="CONEXAO_SESSION_POOLER_DO_SUPABASE"
```

- `DATABASE_URL`: conexão da aplicação, normalmente na porta `6543`.
- `DIRECT_URL`: conexão usada nas migrations, normalmente na porta `5432`.
- Senhas com símbolos precisam estar codificadas para URL.
- Nunca envie o arquivo `.env` ao GitHub.

Para criar o primeiro administrador, acrescente temporariamente ao `.env.local`:

```env
INITIAL_ADMIN_NAME="Administrador"
INITIAL_ADMIN_EMAIL="admin@helpdesk.local"
INITIAL_ADMIN_PASSWORD="UMA_SENHA_FORTE"
```

Em seguida, execute:

```powershell
npm.cmd run admin:create
```

O comando pode ser executado novamente para atualizar a senha do administrador inicial. O `.env.local` também é ignorado pelo Git.

Prepare e confira o Prisma:

```powershell
npx.cmd prisma generate
npx.cmd prisma migrate status
```

O resultado esperado contém:

```text
Database schema is up to date!
```

Inicie a API:

```powershell
npm.cmd run start:dev
```

### 3. Configurar o frontend

Abra outro terminal na raiz do projeto:

```powershell
Set-Location frontend
npm.cmd install
Copy-Item .env.example .env.local
npm.cmd run dev
```

Acesse [http://localhost:3002](http://localhost:3002). A página inicial redireciona para `/login`.

## Banco de dados

O schema inicial possui:

### `User`

- Nome e e-mail.
- Senha armazenada somente como hash `bcrypt`.
- Papel `USER` ou `ADMIN`.
- Estado ativo ou desativado.

### `Ticket`

- Número sequencial usado para montar o protocolo.
- Assunto e descrição.
- Urgência `LOW`, `MEDIUM`, `HIGH` ou `CRITICAL`.
- Status `OPEN`, `IN_PROGRESS` ou `RESOLVED`.
- Relação com o usuário solicitante.

### `Attachment`

- Nome, tipo e tamanho do arquivo.
- Caminho privado do arquivo.
- Relação com o chamado.

Durante o desenvolvimento, os arquivos são gravados em `backend/uploads/anexos` e essa pasta é ignorada pelo Git. Para publicar o sistema e compartilhar anexos entre todos os integrantes, a próxima evolução é trocar esse armazenamento local por um bucket privado no Supabase Storage.

### `RegistroLogin`

- Resultado da tentativa de login.
- E-mail informado, IP, navegador e horário.
- Motivo interno da falha, quando houver.
- Nunca armazena a senha digitada.

### `MensagemChamado`

- Texto da mensagem, autor, chamado e horário.
- Permite conversa entre o administrador e o dono do chamado.
- É removida automaticamente se o chamado for excluído.

Não edite manualmente a tabela `_prisma_migrations` no Supabase.

## API disponível

### Autenticação

| Método | Endpoint          | Acesso      | Finalidade                |
| ------ | ----------------- | ----------- | ------------------------- |
| `POST` | `/api/auth/login` | Público     | Entrar com e-mail e senha |
| `GET`  | `/api/auth/me`    | Autenticado | Consultar o usuário atual |

O token retornado pelo login deve ser enviado nas rotas protegidas:

```text
Authorization: Bearer TOKEN_JWT
```

### Usuários

Todas as rotas abaixo exigem uma conta com papel `ADMIN`.

| Método  | Endpoint                | Finalidade                          |
| ------- | ----------------------- | ----------------------------------- |
| `POST`  | `/api/users`            | Criar usuário                       |
| `GET`   | `/api/users`            | Listar usuários                     |
| `GET`   | `/api/users/:id`        | Visualizar usuário                  |
| `PATCH` | `/api/users/:id`        | Editar nome, e-mail, senha ou papel |
| `PATCH` | `/api/users/:id/status` | Ativar ou desativar usuário         |

As respostas nunca retornam o hash da senha.

### Chamados

Todas as rotas exigem autenticação. Usuários comuns acessam somente os próprios chamados; administradores podem consultar todos.

| Método  | Endpoint                            | Finalidade                       |
| ------- | ----------------------------------- | -------------------------------- |
| `POST`  | `/api/chamados`                     | Abrir chamado com anexo opcional |
| `GET`   | `/api/chamados`                     | Listar chamados permitidos       |
| `GET`   | `/api/chamados/:id`                 | Visualizar os detalhes           |
| `GET`   | `/api/chamados/:id/anexos/:anexoId` | Baixar um anexo autorizado       |
| `PATCH` | `/api/chamados/:id/status`          | Alterar status (somente `ADMIN`) |
| `POST`  | `/api/chamados/:id/mensagens`       | Enviar mensagem na conversa      |

O envio usa `multipart/form-data`. O anexo é opcional, aceita PNG, JPG ou PDF e possui limite de 5 MB.

## Comandos úteis

### Backend

```powershell
npm.cmd run start:dev       # inicia a API em desenvolvimento
npm.cmd run build           # compila para produção
npm.cmd run lint:check      # verifica o código sem alterar
npm.cmd test                # executa testes unitários
npm.cmd run prisma:generate # gera o Prisma Client
npm.cmd run prisma:status   # confere as migrations
npm.cmd run prisma:studio   # abre o editor visual do banco
npm.cmd run admin:create    # cria ou atualiza o administrador inicial
```

### Frontend

```powershell
npm.cmd run dev       # inicia o Next.js
npm.cmd run build     # cria o build de produção
npm.cmd run lint      # verifica o código
npm.cmd run typecheck # verifica os tipos TypeScript
```

No PowerShell, usamos `npm.cmd` e `npx.cmd` para evitar o bloqueio de scripts `.ps1` do Windows.

## Fluxo de trabalho com Git

Antes de começar uma tarefa:

```powershell
git checkout main
git pull origin main
git switch -c nome-da-tarefa
```

Depois de desenvolver e testar:

```powershell
git status
git add .
git commit -m "Descrição curta da alteração"
git push -u origin nome-da-tarefa
```

Nunca versionar:

- `.env` ou `.env.local`.
- Senhas e chaves secretas.
- `node_modules`.
- `.next`, `dist` ou arquivos gerados do Prisma.

## Roadmap até a entrega

| Período  | Objetivo                                                                      |
| -------- | ----------------------------------------------------------------------------- |
| 16–17/08 | Fundação do projeto, Supabase, Prisma, builds e documentação                  |
| 18–19/08 | Usuários, hash de senha, administrador inicial e autenticação JWT — concluído |
| 20–21/08 | Criação, listagem e detalhes dos chamados                                     |
| 22/08    | Alteração de status e dashboard                                               |
| 23/08    | Supabase Storage e anexos                                                     |
| 24/08    | Integração final, testes e correções                                          |
| 25/08    | Revisão, apresentação e entrega                                               |

## Próxima etapa recomendada

Evoluir os anexos e o acompanhamento dos chamados:

1. Migrar os anexos locais para um bucket privado no Supabase Storage.
2. Exibir um histórico das alterações de status.
3. Melhorar os indicadores do dashboard com filtros por período.

## Critérios mínimos para a entrega

- Backend e frontend iniciam sem erro.
- Segredos não aparecem no GitHub.
- Login diferencia usuário e administrador.
- Administrador cria e desativa usuários.
- Usuário abre e acompanha chamados.
- Protocolo é gerado automaticamente.
- Administrador altera o status.
- Anexos são privados.
- README permite que outro integrante execute o projeto.
