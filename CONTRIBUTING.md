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

1. Faça o **Fork** deste repositório.
2. Crie uma branch a partir da `main`:

   ```bash
   git checkout -b feat/nome-da-sua-feature
   # ou
   git checkout -b fix/descricao-do-bug
   ```

3. Use **Conventional Commits**, por exemplo:
   - `feat: adiciona card de projetos`
   - `fix: corrige callback OAuth do Supabase`
   - `docs: atualiza instruções do README`

4. Antes de abrir o PR, valide localmente:

   ```bash
   npm run lint
   npm run format:check
   npm run build
   ```

5. Envie a branch para o seu fork e abra um **Pull Request** para a `main` do repositório oficial.

---

## Padronização e estilo

- Siga o ESLint e o Prettier do projeto (`npm run lint`, `npm run format`).
- Coloque componentes React em `src/components` (UI do shadcn em `src/components/ui`).
- Prefira componentes existentes do `shadcn/ui` antes de criar novos.
- Lógica de autenticação e clientes Supabase ficam em `src/lib/supabase`.
- Schema e acesso a dados: Prisma em `prisma/` e client em `src/lib/prisma.ts`.

---

## Ambiente local (resumo)

```bash
cp .env.example .env
npm install
npm run db:start
npm run db:push
npm run dev
```

Detalhes e variáveis OAuth estão no [README.md](./README.md).

---

## Código de conduta

Trate todos com respeito e empatia. Feedbacks em Pull Requests devem ser construtivos e focados na solução técnica.
