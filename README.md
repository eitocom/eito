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
- **Ambiente local:** [Supabase CLI](https://supabase.com/docs/guides/cli) + Docker

---

## Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) **20.19+**
- [Docker](https://www.docker.com/) (necessário para o Supabase local)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Git](https://git-scm.com/)

### Passo a passo

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/eito.git
   cd eito
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   ```bash
   cp .env.example .env
   ```

   Preencha `NEXT_PUBLIC_SUPABASE_ANON_KEY` (veja com `supabase status` após subir o stack) e, para login social, as credenciais OAuth de GitHub e Google.

4. **Suba o Supabase local:**

   ```bash
   npm run db:start
   ```

5. **Sincronize o schema do Prisma:**

   ```bash
   npm run db:push
   ```

6. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm run dev
   ```

Acesse [http://127.0.0.1:3000](http://127.0.0.1:3000). Sem sessão, você será redirecionado para `/login`.

### Scripts úteis

| Comando               | Descrição                        |
| --------------------- | -------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento      |
| `npm run lint`        | ESLint                           |
| `npm run format`      | Formata com Prettier             |
| `npm run db:start`    | Sobe o Supabase local            |
| `npm run db:stop`     | Para o Supabase local            |
| `npm run db:push`     | Sincroniza o schema Prisma       |
| `npm run db:studio`   | Abre o Prisma Studio             |

---

## Como contribuir

O Eito é construído pela própria comunidade. Leia o guia completo em [CONTRIBUTING.md](./CONTRIBUTING.md).

Procurando por onde começar? Confira issues com a tag [`good-first-issue`](https://github.com/seu-usuario/eito/issues?q=is%3Aissue+is%3Aopen+label%3A%22good-first-issue%22).

---

## Contribuidores

Agradecimento a todos que ajudam a erguer o Eito:

<a href="https://github.com/seu-usuario/eito/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=seu-usuario/eito" alt="Contribuidores do Eito" />
</a>

---

## Licença

Este projeto está sob a licença [MIT](./LICENSE).
