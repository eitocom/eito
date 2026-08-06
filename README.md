# 🌾 Eito

> **O mutirão de código do ecossistema brasileiro.**  
> Uma plataforma colaborativa open source para financiamento, gestão e entrega de projetos de software via bounties e contribuições comunitárias.

---

## 💡 O que é o Eito?

O **Eito** conecta mantenedores de projetos, startups e desenvolvedores no Brasil. Inspirado no conceito de financiamento coletivo e plataformas de _bounties_ internacionais, o Eito permite que qualquer pessoa ou empresa abra projetos públicos, organize tarefas via Kanban/Scrum e financie a resolução de _issues_ com recompensas diretas via **PIX**.

### 🌟 Pilares Principais

- **Projetos Abertos & Transparência:** Cadastre repositórios públicos e organize a gestão do projeto em um só lugar.
- **Micro-recompensas via PIX:** Financie _features_ ou correções de bugs sem burocracia internacional.
- **Portfólio Real & Colaboração:** Desenvolvedores contribuem com código verificado via Pull Request e acumulam reputação e ganhos reais.

---

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js (App Router)](https://nextjs.org/) + TypeScript
- **UI & Estilo:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Banco de Dados & Autenticação:** [Supabase](https://supabase.com/) (PostgreSQL + OAuth GitHub)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Ambiente Local:** Docker / Docker Compose

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Docker](https://www.docker.com/) e Docker Compose
- [Git](https://git-scm.com/)

### Passo a Passo

1. **Clone o repositório:**
   git clone https://github.com/seu-usuario/eito.git
   cd eito

2. **Instale as dependências:**
   npm install

3. **Configure as variáveis de ambiente:**
   cp .env.example .env

4. **Suba o banco de dados PostgreSQL via Docker:**
   docker compose up -d

5. **Execute as migrations do Prisma:**
   npx prisma db push

6. **Inicie o servidor de desenvolvimento:**
   npm run dev

Acesse `http://localhost:3000` no seu navegador.

---

## 🤝 Como Contribuir

O Eito é construído pela própria comunidade! Se você quer ajudar a criar essa plataforma, leia nosso guia completo em [CONTRIBUTING.md](./CONTRIBUTING.md).

Procurando por onde começar? Confira nossas issues com a tag [`good-first-issue`](https://github.com/seu-usuario/eito/issues?q=is%3Aissue+is%3Aopen+label%3A%22good-first-issue%22).

---

## 👥 Contribuidores

Agradecimento especial a todos que ajudam a erguer o Eito:

<a href="https://github.com/seu-usuario/eito/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=seu-usuario/eito" />
</a>

---

## 📄 Licença

Este projeto está sob a licença [MIT](./LICENSE).
