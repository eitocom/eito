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
- **Package manager:** [Yarn](https://yarnpkg.com/) `1.22`
- **Ambiente local:** [Supabase CLI](https://supabase.com/docs/guides/cli) + Docker
- **Commits:** Conventional Commits via Commitizen + Husky + Commitlint

---

## Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) **20.19+**
- [Yarn](https://yarnpkg.com/) **1.22** (o repositório define `packageManager` no `package.json`)
- [Docker](https://www.docker.com/) (necessário para o Supabase local)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
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

3. **Configure as variáveis de ambiente:**

   ```bash
   cp .env.example .env
   ```

   Preencha `NEXT_PUBLIC_SUPABASE_ANON_KEY` (veja com `supabase status` após subir o stack) e, para login social, as credenciais OAuth de GitHub e Google.

4. **Suba o Supabase local:**

   ```bash
   yarn db:start
   ```

5. **Sincronize o schema do Prisma:**

   ```bash
   yarn db:push
   ```

6. **Inicie o servidor de desenvolvimento:**

   ```bash
   yarn dev
   ```

Acesse [http://127.0.0.1:3000](http://127.0.0.1:3000). Sem sessão, você será redirecionado para `/login`.

### Scripts úteis

| Comando             | Descrição                                |
| ------------------- | ---------------------------------------- |
| `yarn dev`          | Servidor de desenvolvimento              |
| `yarn build`        | Gera Prisma Client e build do Next.js    |
| `yarn lint`         | ESLint                                   |
| `yarn format`       | Formata com Prettier                     |
| `yarn format:check` | Verifica formatação sem alterar arquivos |
| `yarn commit`       | Commit assistido (Commitizen)            |
| `yarn db:start`     | Sobe o Supabase local                    |
| `yarn db:stop`      | Para o Supabase local                    |
| `yarn db:push`      | Sincroniza o schema Prisma               |
| `yarn db:studio`    | Abre o Prisma Studio                     |

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
