# Organização do backend

O backend está separado por responsabilidade para facilitar a localização dos arquivos.

```text
src/
├── generated/                       # Código criado automaticamente pelo Prisma
├── infrastructure/
│   └── database/                    # Conexão do NestJS com o Prisma
├── modules/
│   ├── auth/                        # Login, auditoria, JWT e permissões
│   ├── tickets/                     # Chamados, mensagens e anexos
│   └── users/                       # Criação e consulta de usuários
├── main.ts                          # Ponto de entrada exigido pelo NestJS
└── app.module.ts                    # Reúne os módulos da aplicação
```

## Padrão dos nomes

- `*.controller.ts`: recebe as requisições HTTP.
- `*.service.ts`: contém as regras da aplicação.
- `*.module.ts`: registra controladores e serviços no NestJS.
- `*.dto.ts`: valida os dados recebidos pela API.
- `*.guard.ts`: decide se a requisição pode acessar a rota.
- `*.strategy.ts`: implementa uma estratégia de autenticação do Passport.
- `*.spec.ts`: contém testes automatizados.

## Nomes que continuam em inglês

Os caminhos da API (`auth` e `users`), os campos JSON (`name`, `password`, `accessToken` etc.) e o conteúdo de `generated/` não foram traduzidos. Eles são contratos já utilizados pelo frontend ou nomes produzidos pelo Prisma. Alterá-los quebraria a integração existente.
