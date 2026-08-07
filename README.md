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
- **Package manager:** [Yarn](https://yarnpkg.com/) `1.22` (use Yarn; o repositório não usa `npm`/`pnpm`)
- **Ambiente local:** [Supabase CLI](https://supabase.com/docs/guides/cli) + Docker
- **Commits:** Conventional Commits via Commitizen + Husky + Commitlint

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

Acesse [http://127.0.0.1:3000](http://127.0.0.1:3000). Sem sessão, a app redireciona para `/login`.

### Login local (OAuth mock)

Com `GITHUB_CLIENT_ID` / `GOOGLE_CLIENT_ID` **vazios** e `NODE_ENV` de desenvolvimento, o login social usa um mock local (não precisa criar apps OAuth).

- Preencha `SUPABASE_SERVICE_ROLE_KEY` (passo 5).
- Em `/login`, use **Continuar com GitHub** ou **Continuar com Google** (o botão indica que é simulado).
- Para OAuth real, preencha os `CLIENT_ID`/`CLIENT_SECRET` e configure o callback  
  `http://127.0.0.1:54321/auth/v1/callback` nos provedores.

### Portas locais

| Serviço       | URL / porta            |
| ------------- | ---------------------- |
| App (Next.js) | http://127.0.0.1:3000  |
| Supabase API  | http://127.0.0.1:54321 |
| Postgres      | `127.0.0.1:54322`      |
| Studio        | http://127.0.0.1:54323 |
| Mailpit       | http://127.0.0.1:54324 |

### Scripts úteis

| Comando             | Descrição                                |
| ------------------- | ---------------------------------------- |
| `yarn dev`          | Servidor de desenvolvimento              |
| `yarn build`        | Gera Prisma Client e build do Next.js    |
| `yarn lint`         | ESLint                                   |
| `yarn format`       | Formata com Prettier                     |
| `yarn format:check` | Verifica formatação sem alterar arquivos |
| `yarn commit`       | Commit assistido (Commitizen)            |
| `yarn db:start`     | Sobe o Supabase local (`supabase start`) |
| `yarn db:stop`      | Para o Supabase local                    |
| `yarn db:push`      | Sincroniza o schema Prisma (`db push`)   |
| `yarn db:migrate`   | Cria/aplica migrations Prisma            |
| `yarn db:studio`    | Abre o Prisma Studio                     |

### Problemas comuns

- **`P1001: Can't reach database server at 127.0.0.1:54322`** — o Supabase não está no ar. Rode `yarn db:start` e confirme com `supabase status`.
- **Login social mock falha** — confira `SUPABASE_SERVICE_ROLE_KEY` no `.env` (`supabase status -o env` → `SERVICE_ROLE_KEY`).
- **Docker parado** — o `yarn db:start` depende do Docker em execução.
- **Chaves desatualizadas após reset do stack** — rode `supabase status -o env` de novo e atualize o `.env`.

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
