# Guia de Contribuição - Eito 🌾

Ficamos muito felizes pelo seu interesse em contribuir com o **Eito**! Este documento estabelece as diretrizes para que o processo de colaboração seja transparente, organizado e eficiente para todos.

---

## 📋 Como Posso Contribuir?

### 1. Pegando uma Issue Existente

1. Navegue pela aba de **Issues** do repositório.
2. Escolha uma issue aberta que esteja sem atribuição.
3. Deixe um comentário na issue dizendo: _"Gostaria de trabalhar nesta issue!"_.
4. Aguarde a confirmação de um mantenedor antes de começar a codificar (para evitar trabalho duplicado).

### 2. Reportando Bugs ou Sugerindo Features

Se você encontrou um erro ou tem uma ideia de melhoria:

- Verifique se a ideia/bug já não foi reportado nas Issues.
- Caso não tenha sido, abra uma nova Issue utilizando os modelos predefinidos (_Bug Report_ ou _Feature Request_).

---

## 💻 Fluxo de Trabalho (Git Workflow)

1. Faça o **Fork** deste repositório.
2. Crie uma _branch_ específica para a sua alteração a partir da `main`:
   git checkout -b feat/nome-da-sua-feature

   # ou

   git checkout -b fix/descricao-do-bug

3. Faça suas alterações e siga o padrão de **Conventional Commits**:
   - `feat: adiciona componente de card de projetos`
   - `fix: corrige rota de autenticação do Supabase`
   - `docs: atualiza instruções do README`

4. Certifique-se de que o projeto está compilando e sem erros de TypeScript:
   npm run build

5. Envie a branch para o seu fork e abra um **Pull Request (PR)** apontando para a branch `main` do repositório oficial.

---

## 📐 Padronização e Estilo de Código

- Utilize o ESLint e Prettier configurados no projeto (`npm run lint`).
- Mantenha componentes React modularizados dentro da pasta `/components`.
- Dê preferência por utilizar os componentes do `shadcn/ui` já existentes.

---

## 📜 Código de Conduta

Trate todos os colaboradores com respeito e empatia. Críticas a Pull Requests devem ser sempre construtivas e focadas na solução técnica.
