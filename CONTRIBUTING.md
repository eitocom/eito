# Guia de Contribuição — Eito

Obrigado pelo interesse em contribuir com o **Eito**. Este guia define o fluxo para manter a colaboração transparente e eficiente.

O Eito é um mutirão de código: conectamos mantenedores, startups e desenvolvedores no Brasil para financiar e entregar software com recompensas via **PIX**, verificação por Pull Request e gestão de tarefas em projetos abertos.

---

## Como posso contribuir?

### 1. Pegando uma issue existente

1. Navegue pela aba de **Issues** do repositório.
2. Escolha uma issue aberta sem atribuição.
3. Comente: _"Gostaria de trabalhar nesta issue!"_.
4. Aguarde a confirmação de um mantenedor antes de começar (evita trabalho duplicado).

### 2. Reportando bugs ou sugerindo features

- Verifique se o tema já não existe nas Issues.
- Se não existir, abra uma nova Issue com o modelo **Bug Report** ou **Feature Request**.

---

## Fluxo de trabalho (Git)

1. Faça o **Fork** deste repositório (ou clone se tiver acesso de escrita).
2. Parta da branch `develop` e crie a sua branch:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/nome-da-sua-feature
   # ou
   git checkout -b fix/descricao-do-bug
   ```

3. Faça commits seguindo o padrão descrito em [Padrão de commits](#padrão-de-commits).
4. Antes de abrir o PR, valide localmente:

   ```bash
   yarn lint
   yarn format:check
   yarn build
   ```

5. Envie a branch e abra um **Pull Request** para a `develop` do repositório oficial.

---

## Padrão de commits

O projeto usa **[Conventional Commits](https://www.conventionalcommits.org/)**, com validação automática via **Husky** + **Commitlint**. Commits fora do padrão são rejeitados no `commit-msg`.

### Como criar um commit

Prefira o Commitizen (assistente interativo):

```bash
yarn commit
```

Isso abre um questionário (tipo, escopo opcional, descrição, etc.) e gera a mensagem no formato correto.

Se preferir `git commit` manualmente, a mensagem **deve** seguir o formato:

```text
tipo(escopo opcional): descrição curta
```

Exemplos:

- `feat: adiciona card de projetos`
- `fix: corrige callback OAuth do Supabase`
- `docs: atualiza instruções do README`
- `chore(auth): configura commitlint`

### Tipos permitidos

| Tipo       | Quando usar                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | Nova funcionalidade                                     |
| `fix`      | Correção de bug                                         |
| `docs`     | Documentação (README, CONTRIBUTING, etc.)               |
| `style`    | Formatação, CSS ou UI sem mudança de lógica             |
| `refactor` | Reestruturação de código existente                      |
| `perf`     | Melhoria de performance                                 |
| `test`     | Testes automatizados                                    |
| `build`    | Build, pacotes ou Docker                                |
| `ci`       | CI/CD (GitHub Actions, etc.)                            |
| `chore`    | Tarefas diversas (configs, `.gitignore`, tooling, etc.) |
| `revert`   | Reverter um commit anterior                             |

### Hooks locais (Husky)

Após `yarn install`, os hooks ficam ativos:

- **pre-commit** — executa `yarn lint`
- **commit-msg** — valida a mensagem com Commitlint

Se o lint ou a mensagem falharem, o commit não é criado. Corrija e tente de novo.

---

## Padronização e estilo

- Siga o ESLint e o Prettier do projeto (`yarn lint`, `yarn format`).
- Coloque componentes React em `src/components` (UI do shadcn em `src/components/ui`).
- Prefira componentes existentes do `shadcn/ui` antes de criar novos.
- Lógica de autenticação e clientes Supabase ficam em `src/lib/supabase`.
- Schema e acesso a dados: Prisma em `prisma/` e client em `src/lib/prisma.ts`.
- Validação de payload de API com **Zod** (ex.: `src/lib/projects/schema.ts`, `src/lib/tasks/schema.ts`).

---

## Documentação da API

A especificação OpenAPI é gerada a partir dos schemas Zod (`@asteasolutions/zod-to-openapi`) e exibida com **Stoplight Elements** em `/docs` (não usamos Swagger UI).

| Artefato         | Onde                                          |
| ---------------- | --------------------------------------------- |
| UI               | `http://127.0.0.1:3000/docs` (com `yarn dev`) |
| JSON OpenAPI 3.1 | `http://127.0.0.1:3000/api/openapi`           |
| Coleção Postman  | `docs/Eito.postman_collection.json`           |
| Registry / paths | `src/lib/openapi/document.ts`                 |

### Ao criar ou alterar uma rota `/api/...`

1. Defina ou reutilize o schema Zod (com `import "@/lib/openapi/zod-extend"` no topo do arquivo de schema, para o `.openapi()` funcionar no Zod 4).
2. Registre o path e o body/respostas em `src/lib/openapi/document.ts` (`openApiRegistry.registerPath`).
3. Confira em `/docs` e em `/api/openapi` se o endpoint aparece corretamente.
4. Se a rota for útil para testes manuais, atualize `docs/Eito.postman_collection.json` (variáveis `baseUrl`, `sessionCookie`, `projectSlug`, `projectId`, `taskId`).

`/docs` e `/api/openapi` são públicos no middleware; as rotas de negócio permanecem autenticadas (cookie de sessão Supabase). No Postman/Try it, autentique-se na app e copie o cookie de sessão para a variável `sessionCookie` (ou Cookie Manager).

No Pull Request que mexe em API, marque no checklist se a OpenAPI (e Postman, se aplicável) foi atualizada.

---

## Ambiente local (resumo)

```bash
yarn
cp .env.example .env
yarn db:start
# preencha NEXT_PUBLIC_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY
# com `supabase status -o env`
yarn db:push
yarn dev
```

Detalhes, portas, OAuth mock e troubleshooting estão no [README.md](./README.md).

Para publicar a app (Vercel + Supabase cloud), siga a seção [Deploy (Vercel + Supabase)](./README.md#deploy-vercel--supabase) no README — variáveis de ambiente, OAuth real, `db push` e Site URL.

---

## Código de conduta

Trate todos com respeito e empatia. Feedbacks em Pull Requests devem ser construtivos e focados na solução técnica.
