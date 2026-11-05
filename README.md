# 🐾 Sistema de Petshop | Fullstack App

Este é um sistema para gerenciamento de pets desenvolvido com **Next.js**, **Express** e **MySQL**, ideal para petshops que desejam organizar o cadastro de animais e se comunicar com seus donos facilmente.

🔗 **Funcionalidade principal:** Cadastro de pets com dados dos donos, listagem, busca, edição, exclusão e contato via WhatsApp.

> ⚠️ **Correção em relação à versão anterior deste arquivo:** a persistência real do projeto é **MySQL** (driver `mysql`, ver `api/db.js`). As bibliotecas de MongoDB citadas anteriormente neste README não são importadas por nenhum arquivo de código do projeto.

---

## ✨ Funcionalidades

- ➕ Cadastro de Pets com informações do dono  
- 🔍 Busca por nome do pet ou nome do dono  
- 📋 Listagem de pets em ordem alfabética na página inicial  
- ✏️ Edição e exclusão de registros  
- 📱 Botão de contato via WhatsApp com o dono  

Todas as funcionalidades acima existem no código. Nenhuma delas foi **executada e validada** até o momento — ver `memory-bank/CURRENT-STATE.md`.

---

## 📌 Informações Armazenadas

### 🐶 Pet
- Nome (`namePet`)
- Tipo de animal (`animal`)
- Raça (`raca`)
- Data de nascimento (`data`)

### 👤 Dono
- Nome (`nameDono`)
- Telefone (`telefone`)

Campos observados nas queries de `api/controllers/pet.js`. O DDL da tabela `pets` não foi encontrado entre os arquivos do projeto — ver `docs/ARQUITETURA.md`.

---

## 🧰 Tecnologias Utilizadas

> Os números abaixo são **faixas declaradas** nos manifests (`^` = versão mínima compatível). Eles **não provam qual versão está instalada** — para isso é preciso lockfile ou instalação.

### 🖥️ Frontend (raiz do repositório)

Versões **declaradas** em `package.json` da raiz. O repositório **não tem lockfile versionado** no `HEAD`. Há hoje um lockfile **local** (`package-lock.json`, não rastreado, origem não confirmada) — a árvore resolvida por ele é **observação local**, não algo definido por este repositório.

- [Next.js](https://nextjs.org/) `^14.2.3` — App Router em `src/app`
- [React](https://reactjs.org/) `^18.2.0` / React DOM `^18.2.0`
- [Styled-components](https://styled-components.com/) `^6.1.11`
- [React Hook Form](https://react-hook-form.com/) `^7.51.5`
- [Zod](https://github.com/colinhacks/zod) `^3.23.8` + `@hookform/resolvers` `^3.4.2`
- [React Modal](https://reactcommunity.org/react-modal/) `^3.16.1`
- [React Toastify](https://fkhadra.github.io/react-toastify/) `^10.0.5`
- [Axios](https://axios-http.com/) `^1.7.2`

### 🌐 Backend (`api/`)

Versões **declaradas** em `api/package.json`. Diferentemente da raiz, a API **possui lockfile** (`api/package-lock.json`), e nele as versões **resolvidas** das dependências diretas conferidas coincidem com as declaradas: `express` 4.19.2, `mysql` 2.18.1, `cors` 2.8.5, `nodemon` 3.1.1.

- [Express.js](https://expressjs.com/) `^4.19.2`
- [CORS](https://www.npmjs.com/package/cors) `^2.8.5`
- [MySQL — driver `mysql`](https://www.npmjs.com/package/mysql) `^2.18.1`
- [Nodemon](https://www.npmjs.com/package/nodemon) `^3.1.1`

### 📦 Declaradas no `package.json` da raiz, sem importação identificada em código
`@aws-sdk/credential-providers`, `@mongodb-js/zstd`, `aws4`, `gcp-metadata`, `mongodb`, `mongodb-client-encryption`, `snappy`, `mongoose`.

---

## 📁 Estrutura Resumida

```
.
├── package.json          # app Next.js (raiz)
├── next.config.mjs       # sem pageExtensions configurado
├── jsconfig.json         # alias @/* -> ./src/*
├── api/                  # backend Express (porta 8800)
│   ├── index.js          # entrada do Express
│   ├── db.js             # conexão MySQL
│   ├── controllers/pet.js
│   └── routes/pets.js
└── src/
    ├── app/              # App Router: layout.js, page.js, globals.css
    ├── assets/icone/     # arquivos SVG
    └── components/       # componentes compartilhados
```

A descrição detalhada do fluxo de dados está em `docs/ARQUITETURA.md`.

---

## ️ Scripts Disponíveis

| Local | Comando | O que faz |
|---|---|---|
| raiz | `npm run dev` | Inicia o Next.js em modo desenvolvimento |
| raiz | `npm run build` | Gera a build de produção |
| raiz | `npm start` | `next start` — serve a build |
| raiz | `npm run lint` | `next lint` |
| `api/` | `npm start` | `nodemon index.js` — API na porta 8800 |

Não existe script de teste no projeto.

---

## ▶️ Execução

Procedimento **identificado a partir dos arquivos** e **não executado** nesta etapa:

1. Manter um MySQL acessível com o database `petscrud` já criado.
2. Em `api/`, instalar dependências e iniciar: `npm install` e `npm start` (porta 8800).
3. Na raiz, instalar dependências e iniciar: `npm install` e `npm run dev` (porta 3000).

A conexão com o banco é configurada **exclusivamente por variáveis de ambiente**, todas obrigatórias: `DB_HOST`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`. Sem elas (ou com alguma vazia/`""`), a API **falha ao iniciar**, antes de qualquer consulta, listando apenas os nomes ausentes. `api/.env.example` documenta os nomes com placeholders — `.env` está fora do versionamento e **não é carregado automaticamente** pelo aplicativo; quem carrega o ambiente é o processo de execução/launcher/instalador.

---

## ⚠️ Pendências para instalação reproduzível

- **Raiz:** sem lockfile versionado no repositório. Há hoje um lockfile local (não rastreado, origem não confirmada) — a árvore resolvida por ele é observação local e não está definida pelo repositório.
- **API:** possui `api/package-lock.json` — situação distinta da raiz. A instalação da API é reproduzível; a da raiz não é.
- O `.gitignore` da raiz contém apenas `/node_modules`, que não cobre `api/node_modules` — esse diretório está versionado.
- O diretório de cache `.next/` também está versionado.
- Não há DDL, migration ou seed para criar a tabela `pets`.
- `eslint-config-next` está declarado em `dependencies` em vez de `devDependencies`.
- `styled-components` é usado em código sem plugin SWC/Babel configurado em `next.config.mjs`.

Esses pontos estão detalhados em `memory-bank/CURRENT-STATE.md`.

---

## 📚 Documentação técnica

- [AGENTS.md](AGENTS.md) — ponto de entrada para agentes
- [PROJETO.md](PROJETO.md) — escopo, funcionalidades e regras observadas
- [docs/ARQUITETURA.md](docs/ARQUITETURA.md) — arquitetura e fluxo de dados
- [memory-bank/CURRENT-STATE.md](memory-bank/CURRENT-STATE.md) — estado atual e pendências
- [memory-bank/DECISIONS.md](memory-bank/DECISIONS.md) — fatos, decisões e propostas
- [memory-bank/CHANGELOG.md](memory-bank/CHANGELOG.md) — trabalho documental realizado
- [SECURITY-AUDIT.md](SECURITY-AUDIT.md) — relatório da auditoria de segurança

---

## 📬 Contato

- 💼 LinkedIn: [linkedin.com/in/svitordev](https://www.linkedin.com/in/devsvitor/)
- 🐙 GitHub: [github.com/svitordev](https://github.com/svitordev)
- ✉️ Email: [svitor.dev@gmail.com](mailto:svitor.dev@gmail.com)
