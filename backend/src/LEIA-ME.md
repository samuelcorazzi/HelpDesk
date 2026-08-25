# Organização do backend

O backend está separado por responsabilidade para facilitar a localização dos arquivos.

```text
src/
├── generated/                       # Código criado automaticamente pelo Prisma
├── infraestrutura/
│   └── banco-de-dados/              # Conexão do NestJS com o Prisma
├── modulos/
│   ├── autenticacao/                # Login, auditoria, JWT e permissões
│   └── usuarios/                    # Criação e gerenciamento de usuários
├── main.ts                          # Ponto de entrada exigido pelo NestJS
└── modulo-principal.ts              # Reúne os módulos da aplicação
```

## Padrão dos nomes

- `*.controlador.ts`: recebe as requisições HTTP.
- `*.servico.ts`: contém as regras da aplicação.
- `*.modulo.ts`: registra controladores e serviços no NestJS.
- `*.dto.ts`: valida os dados recebidos pela API.
- `*.spec.ts`: contém testes automatizados.

## Nomes que continuam em inglês

Os caminhos da API (`auth` e `users`), os campos JSON (`name`, `password`, `accessToken` etc.) e o conteúdo de `generated/` não foram traduzidos. Eles são contratos já utilizados pelo frontend ou nomes produzidos pelo Prisma. Alterá-los quebraria a integração existente.
