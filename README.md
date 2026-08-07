# Eito

> **O mutirão de código do ecossistema brasileiro.**  
> Plataforma colaborativa open source para financiamento, gestão e entrega de projetos de software via bounties e contribuições comunitárias.

---

## O que é o Eito?

O **Eito** conecta mantenedores de projetos, startups e desenvolvedores no Brasil. Inspirado no financiamento coletivo e em plataformas internacionais de _bounties_, permite que qualquer pessoa ou empresa abra projetos públicos, organize tarefas e financie a resolução de _issues_ com recompensas diretas via **PIX**.

### Pilares

- **Projetos abertos e transparência:** cadastre repositórios públicos e organize a gestão em um só lugar.
- **Micro-recompensas via PIX:** financie features ou correções sem burocracia internacional.
- **Portfólio real e colaboração:** contribuições verificadas via Pull Request, com reputação e ganhos reais.

---

## Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router) + TypeScript
- **UI:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Banco e Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Auth, com OAuth GitHub e Google)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Validação / API docs:** [Zod](https://zod.dev/) + [@asteasolutions/zod-to-openapi](https://github.com/asteasolutions/zod-to-openapi) + [Stoplight Elements](https://stoplight.io/open-source/elements) (sem Swagger UI)
- **Package manager:** [Yarn](https://yarnpkg.com/) `1.22` (use Yarn; o repositório não usa `npm`/`pnpm`)
- **Ambiente local:** [Supabase CLI](https://supabase.com/docs/guides/cli) + Docker
- **Commits:** Conventional Commits via Commitizen + Husky + Commitlint

---

## Documentação da API

Com o app rodando (`yarn dev`), a especificação OpenAPI é gerada a partir dos schemas Zod e exibida de forma interativa:

| Recurso                            | URL / caminho                                                              | Descrição                               |
| ---------------------------------- | -------------------------------------------------------------------------- | --------------------------------------- |
| UI interativa (Stoplight Elements) | [http://127.0.0.1:3000/docs](http://127.0.0.1:3000/docs)                   | Explore endpoints, schemas e Try it     |
| Spec OpenAPI (JSON)                | [http://127.0.0.1:3000/api/openapi](http://127.0.0.1:3000/api/openapi)     | Documento OpenAPI 3.1 gerado em runtime |
| Coleção Postman                    | [`docs/Eito.postman_collection.json`](./docs/Eito.postman_collection.json) | Importe no Postman para chamar a API    |

`/docs` e `/api/openapi` são **públicos** (não exigem login para visualizar). As rotas de negócio (`/api/projects`, `/api/tasks`, etc.) continuam autenticadas via sessão Supabase (cookie).

Código relacionado:

- Registry e paths: `src/lib/openapi/document.ts`
- Extensão Zod para OpenAPI: `src/lib/openapi/zod-extend.ts`
- Route handler da spec: `src/app/api/openapi/route.ts`
- Página Stoplight: `src/app/docs/page.tsx`

Ao adicionar ou alterar uma rota de API, atualize o registro em `src/lib/openapi/document.ts` e, se fizer sentido, a coleção Postman. Detalhes no [CONTRIBUTING.md](./CONTRIBUTING.md#documentação-da-api).

---

## Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) **20.19+** (testado com Node 22)
- [Yarn](https://yarnpkg.com/) **1.22** (definido em `packageManager` no `package.json`)
- [Docker](https://www.docker.com/) rodando (necessário para o Supabase local)
- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado (`supabase --version`)
- [Git](https://git-scm.com/)

### Passo a passo

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/eitocom/eito.git
   cd eito
   ```

2. **Instale as dependências:**

   ```bash
   yarn
   ```

   O `postinstall` já roda `prisma generate`.

3. **Crie o arquivo de ambiente:**

   ```bash
   cp .env.example .env
   ```

   O `.env.example` já traz `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_APP_URL` corretos para o stack local. As chaves do Supabase ainda precisam ser preenchidas no passo 5.

4. **Suba o Supabase local (Docker):**

   ```bash
   yarn db:start
   ```

   Na primeira execução o download das imagens pode demorar. Ao final, o CLI mostra as URLs e as chaves.

   Avisos do tipo `environment variable is unset: GITHUB_CLIENT_ID` são **esperados** se você for usar o login social mock (deixar `CLIENT_ID` vazio).

5. **Preencha as chaves do Supabase no `.env`:**

   ```bash
   supabase status -o env
   ```

   Use os valores do status local:

   | Variável no `.env`              | Origem no `supabase status -o env` |
   | ------------------------------- | ---------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `ANON_KEY` (ou `PUBLISHABLE_KEY`)  |
   | `SUPABASE_SERVICE_ROLE_KEY`     | `SERVICE_ROLE_KEY`                 |

   `SUPABASE_SERVICE_ROLE_KEY` é **obrigatória** para o mock de OAuth (GitHub/Google) em desenvolvimento. Sem ela, o botão de login social falha.

6. **Sincronize o schema do Prisma com o Postgres local:**

   ```bash
   yarn db:push
   ```

   Esperado: `The database is already in sync...` ou aplicação do schema sem erro.  
   A URL padrão é `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.

7. **Inicie o servidor de desenvolvimento:**

   ```bash
   yarn dev
   ```

Acesse [http://127.0.0.1:3000](http://127.0.0.1:3000). Sem sessão, a app redireciona para `/login`. A documentação da API fica em [http://127.0.0.1:3000/docs](http://127.0.0.1:3000/docs).

### Login local (OAuth mock)

Com `GITHUB_CLIENT_ID` / `GOOGLE_CLIENT_ID` **vazios** e `NODE_ENV` de desenvolvimento, o login social usa um mock local (não precisa criar apps OAuth).

- Preencha `SUPABASE_SERVICE_ROLE_KEY` (passo 5).
- Em `/login`, use **Continuar com GitHub** ou **Continuar com Google** (o botão indica que é simulado).
- Para OAuth real, preencha os `CLIENT_ID`/`CLIENT_SECRET` e configure o callback  
  `http://127.0.0.1:54321/auth/v1/callback` nos provedores.

### Portas locais

| Serviço        | URL / porta                       |
| -------------- | --------------------------------- |
| App (Next.js)  | http://127.0.0.1:3000             |
| Docs da API    | http://127.0.0.1:3000/docs        |
| OpenAPI (JSON) | http://127.0.0.1:3000/api/openapi |
| Supabase API   | http://127.0.0.1:54321            |
| Postgres       | `127.0.0.1:54322`                 |
| Studio         | http://127.0.0.1:54323            |
| Mailpit        | http://127.0.0.1:54324            |

### Scripts úteis

| Comando             | Descrição                                                                 |
| ------------------- | ------------------------------------------------------------------------- |
| `yarn dev`          | Servidor de desenvolvimento                                               |
| `yarn build`        | Gera Prisma Client e build do Next.js                                     |
| `yarn lint`         | ESLint                                                                    |
| `yarn format`       | Formata com Prettier                                                      |
| `yarn format:check` | Verifica formatação sem alterar arquivos                                  |
| `yarn commit`       | Commit assistido (Commitizen)                                             |
| `yarn db:start`     | Sobe o Supabase local (`supabase start`)                                  |
| `yarn db:stop`      | Para o Supabase local                                                     |
| `yarn db:push`      | Sincroniza o schema Prisma (`db push`)                                    |
| `yarn db:push:prod` | `db push` usando o `DATABASE_URL` do env (útil com URI do Supabase cloud) |
| `yarn db:migrate`   | Cria/aplica migrations Prisma                                             |
| `yarn db:studio`    | Abre o Prisma Studio                                                      |

### Problemas comuns

- **`P1001: Can't reach database server at 127.0.0.1:54322`** — o Supabase não está no ar. Rode `yarn db:start` e confirme com `supabase status`.
- **Login social mock falha** — confira `SUPABASE_SERVICE_ROLE_KEY` no `.env` (`supabase status -o env` → `SERVICE_ROLE_KEY`).
- **Docker parado** — o `yarn db:start` depende do Docker em execução.
- **Chaves desatualizadas após reset do stack** — rode `supabase status -o env` de novo e atualize o `.env`.
- **`/auth/callback` na Vercel: “This page isn’t working”** — `DATABASE_URL` provavelmente usa o host direto (`db.<ref>.supabase.co:5432`, IPv6). Na Vercel use o **Transaction pooler** (`…pooler.supabase.com:6543`, user `postgres.<ref>`). Veja o comentário em `.env.example`.

---

## Deploy (Vercel + Supabase)

Em produção o mock de OAuth **não funciona** (`NODE_ENV=production`). Use provedores reais no Supabase (GitHub recomendado no primeiro deploy).

### 1. Supabase cloud

1. Crie um projeto em [supabase.com/dashboard](https://supabase.com/dashboard).
2. **Settings → API**: copie Project URL, `anon` key e `service_role` key.
3. **Settings → Database**: copie a connection string (URI).
4. Aplique o schema Prisma no banco cloud (na sua máquina, com a **Direct connection** porta `5432`):

   ```bash
   DATABASE_URL="postgresql://postgres:...@db.<PROJECT_REF>.supabase.co:5432/postgres" yarn db:push
   ```

5. **Authentication → URL Configuration**:
   - **Site URL:** `https://seu-projeto.vercel.app`
   - **Redirect URLs:** `https://seu-projeto.vercel.app/auth/callback`  
     (opcional para previews: `https://*-seu-time.vercel.app/auth/callback`)
6. **Authentication → Providers → GitHub**:
   - Crie um OAuth App em [GitHub Developer Settings](https://github.com/settings/developers).
   - **Authorization callback URL** do GitHub deve ser a do **Supabase**, não da Vercel:  
     `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
   - Cole Client ID e Secret no provider GitHub do Supabase.

### 2. Vercel

1. Importe o repositório `eitocom/eito` no [Vercel](https://vercel.com) (branch de produção: **`develop`**).
2. Framework: Next.js · Install: `yarn` · Build: `yarn build` (já roda `prisma generate`).
3. Configure as Environment Variables (Production e Preview):

| Variável                                    | Origem                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                              | URI do Postgres (na Vercel, preferir **Transaction pooler** porta `6543` com `?pgbouncer=true`)  |
| `NEXT_PUBLIC_SUPABASE_URL`                  | Project URL do Supabase                                                                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`             | anon key                                                                                         |
| `SUPABASE_SERVICE_ROLE_KEY`                 | service_role (somente server)                                                                    |
| `NEXT_PUBLIC_APP_URL`                       | URL canônica, ex. `https://seu-projeto.vercel.app`                                               |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Mesmos do OAuth App (opcional na Vercel se só o Supabase os usa; mantenha alinhados ao provider) |

Referência completa dos nomes está comentada em [`.env.example`](./.env.example).

4. Faça o deploy e valide:
   - Sem sessão, `/` redireciona para `/login`
   - Login GitHub completa via `/auth/callback`
   - Projetos/tarefas leem e gravam no Postgres cloud
   - `/docs` e `/api/openapi` abrem

### Notas

- O script `prepare` do Husky **não** roda na Vercel/CI (`CI` / `VERCEL`), para não quebrar o install.
- Ainda não há pasta `prisma/migrations/`; o bootstrap do schema em cloud usa `yarn db:push`. Migrations versionadas podem vir depois.

---

## Como contribuir

O Eito é construído pela própria comunidade. Leia o guia completo em [CONTRIBUTING.md](./CONTRIBUTING.md).

Resumo: abra branches a partir de `develop`, use `yarn commit` (Conventional Commits) e envie o Pull Request **para `develop`**.

Procurando por onde começar? Confira issues com a label [`good first issue`](https://github.com/eitocom/eito/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

---

## Contribuidores

Agradecimento a todos que ajudam a erguer o Eito:

<a href="https://github.com/eitocom/eito/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=eitocom/eito" alt="Contribuidores do Eito" />
</a>

---

## Licença

Este projeto está sob a licença [MIT](./LICENSE).
