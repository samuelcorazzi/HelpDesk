# Sistema HelpDesk

Projeto acadêmico para abertura, acompanhamento e gerenciamento de chamados de suporte. Usuários poderão registrar solicitações e acompanhar seus protocolos; administradores poderão gerenciar usuários, alterar o status dos chamados e visualizar indicadores.

> Entrega prevista: **25 de agosto de 2026**.

## Estado atual

O repositório contém uma fundação funcional para iniciar o desenvolvimento. As regras de negócio ainda não foram implementadas.

| Item | Estado |
| --- | --- |
| Projeto NestJS | Pronto |
| PostgreSQL no Supabase | Conectado |
| Schema e migration inicial do Prisma | Prontos |
| Prisma Client no NestJS | Configurado |
| Projeto Next.js com TypeScript | Pronto |
| Páginas visuais iniciais | Prontas como estrutura |
| Autenticação JWT | Pendente |
| CRUD de usuários | Pendente |
| CRUD de chamados | Pendente |
| Kanban conectado à API | Pendente |
| Upload no Supabase Storage | Pendente |

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
- Organizar chamados em um Kanban.
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
Next.js :3000
   │ requisições HTTP
   ▼
NestJS :3001/api
   │
   ├── Prisma ──────────► PostgreSQL no Supabase
   └── Supabase Storage ► anexos privados (etapa futura)
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
│   │   ├── database/                # Integração do NestJS com o Prisma
│   │   ├── generated/prisma/        # Gerado automaticamente; não vai ao Git
│   │   ├── health/                  # Endpoint usado para testar a API
│   │   ├── app.module.ts            # Módulo raiz
│   │   └── main.ts                  # Inicialização, CORS e porta
│   ├── .env.example                 # Modelo de configuração sem segredos
│   ├── package.json
│   └── prisma.config.ts
│
├── frontend/                        # Aplicação Next.js
│   ├── src/
│   │   ├── components/              # Header, cartão e Kanban
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
FRONTEND_URL=http://localhost:3000
DATABASE_URL="CONEXAO_TRANSACTION_POOLER_DO_SUPABASE"
DIRECT_URL="CONEXAO_SESSION_POOLER_DO_SUPABASE"
```

- `DATABASE_URL`: conexão da aplicação, normalmente na porta `6543`.
- `DIRECT_URL`: conexão usada nas migrations, normalmente na porta `5432`.
- Senhas com símbolos precisam estar codificadas para URL.
- Nunca envie o arquivo `.env` ao GitHub.

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

Teste em [http://localhost:3001/api/health](http://localhost:3001/api/health). A resposta esperada é semelhante a:

```json
{
  "status": "ok",
  "service": "helpdesk-api",
  "timestamp": "2026-08-16T00:00:00.000Z"
}
```

### 3. Configurar o frontend

Abra outro terminal na raiz do projeto:

```powershell
Set-Location frontend
npm.cmd install
Copy-Item .env.example .env.local
npm.cmd run dev
```

Acesse [http://localhost:3000](http://localhost:3000). A página inicial redireciona para `/login`.

## Banco de dados

O schema inicial possui:

### `User`

- Nome e e-mail.
- Senha armazenada futuramente como hash.
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
- Caminho privado no Supabase Storage.
- Relação com o chamado.

Não edite manualmente a tabela `_prisma_migrations` no Supabase.

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
git checkout -b feature/nome-da-tarefa
```

Depois de desenvolver e testar:

```powershell
git status
git add .
git commit -m "feat: descrição curta da alteração"
git push -u origin feature/nome-da-tarefa
```

Nunca versionar:

- `.env` ou `.env.local`.
- Senhas e chaves secretas.
- `node_modules`.
- `.next`, `dist` ou arquivos gerados do Prisma.

## Roadmap até a entrega

| Período | Objetivo |
| --- | --- |
| 16–17/08 | Fundação do projeto, Supabase, Prisma, builds e documentação |
| 18–19/08 | Usuários, hash de senha, administrador inicial e autenticação JWT |
| 20–21/08 | Criação, listagem e detalhes dos chamados |
| 22/08 | Alteração de status, dashboard e Kanban |
| 23/08 | Supabase Storage e anexos |
| 24/08 | Integração final, testes e correções |
| 25/08 | Revisão, apresentação e entrega |

## Próxima etapa recomendada

Implementar o módulo de usuários no backend:

1. Instalar validação, JWT e biblioteca de hash de senha.
2. Criar DTOs de usuário.
3. Criar `UsersService` e `UsersController`.
4. Criar o administrador inicial por seed.
5. Implementar login e proteção por papel.

## Critérios mínimos para a entrega

- Backend e frontend iniciam sem erro.
- Segredos não aparecem no GitHub.
- Login diferencia usuário e administrador.
- Administrador cria e desativa usuários.
- Usuário abre e acompanha chamados.
- Protocolo é gerado automaticamente.
- Administrador altera o status.
- Kanban mostra as três etapas.
- Anexos são privados.
- README permite que outro integrante execute o projeto.
