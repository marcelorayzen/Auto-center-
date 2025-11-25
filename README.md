🔧 Auto-Center Gestão

Sistema desenvolvido em TypeScript para gerenciamento de oficinas automotivas, incluindo ordens de serviço, clientes e estoque.

🚗 Funcionalidades

Cadastro e gerenciamento de clientes
Emissão e controle de ordens de serviço
Estoque de peças
Relatórios financeiros
Autenticação JWT
API REST própria

🧰 Tecnologias

TypeScript
Node.js / Express
React (se houver front-end)
JWT Auth
Banco de dados SQL / Firestore (dependendo da versão)

Repositório com o frontend React (Vite + TypeScript) e um backend leve em Express + Prisma (SQLite) para desenvolvimento local.

Conteúdo deste README:
- Instruções para rodar localmente (frontend e backend)
- Configuração de banco de dados (Prisma + SQLite)
- Geração de ícones
- Fluxo de commits e branchs
- CI (GitHub Actions)
- Deploy básico

---

## Rodando localmente

### Pré-requisitos
- Node.js (18+ recomendado)

### Frontend
1. Instale as dependências (na raiz do projeto):
```powershell
npm install
```
2. Inicie o servidor de desenvolvimento:
```powershell
npm run dev
```
3. Abra no navegador: http://localhost:3000

### Backend (Express + Prisma)
1. Entre na pasta do servidor e instale dependências:
```powershell
cd server
npm install
```
2. Gere o cliente do Prisma e aplique migrações (essa operação cria `prisma/dev.db`):
```powershell
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate dev --schema=prisma/schema.prisma --name init
```
3. (Opcional) Rode o seed para popular com dados de exemplo:
```powershell
npm run seed
```
4. Inicie o servidor:
```powershell
npm start
```
O servidor roda por padrão em http://localhost:4000

---

## Geração de ícones
Coloque os arquivos de ícone na pasta `public/` com os seguintes nomes:
- `public/favicon.ico` (ico/32x32)
- `public/apple-touch-icon.png` (180x180)
- `public/icons/icon-192.png` (192x192)
- `public/icons/icon-512.png` (512x512)

Você pode usar ImageMagick ou o script Node já incluso (`scripts/generate-icons.mjs`).
Exemplo com ImageMagick:
```powershell
magick convert source.png -resize 192x192 public/icons/icon-192.png
magick convert source.png -resize 512x512 public/icons/icon-512.png
magick convert source.png -resize 180x180 public/apple-touch-icon.png
magick convert source.png -resize 32x32  public/favicon.ico
```
Ou rode o script:
```powershell
npm run generate-icons
```

---

## Fluxo de commits / branchs
- Faça commits pequenos e descritivos: `git commit -m "feat: adicionar nova feature"`
- Use branchs com padrões: `feature/*`, `fix/*`, `chore/*`
- Antes de subir: `git push -u origin <branch>`

### Boas práticas
- Execute `npm run build` e `npx tsc --noEmit` antes do commit para garantir que o build funcione e que não haja erros de tipos.

---

## CI / GitHub Actions
Há um workflow de CI que roda em `main` (`.github/workflows/ci.yml`) e um workflow de checks (`.github/workflows/checks.yml`) que executa typecheck e build para PRs e pushes na branch `main`.

---

## Deploy básico
- Frontend: gere o build com `npm run build` e publique o conteúdo de `dist/` em serviços como Vercel ou Netlify.
- Backend: para produção use Postgres (ou outro DB robusto), configure variáveis de ambiente e execute com um process manager (PM2) ou conteinerize com Docker.

---


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

This repository contains a frontend React (Vite + TypeScript) application and a minimal Express + Prisma (SQLite) backend for local development.

Table of contents
- Setup (Frontend and Backend)
- Running locally
- Database (Prisma / SQLite)
- Generating icons
- Development tips (commit and push)
- CI / GitHub Actions
- Deploy

---

Quick start (frontend)
1. Install dependencies:
   ```powershell
   npm install
   ```
2. Start the dev server:
   ```powershell
   npm run dev
   ```
3. Open http://localhost:3000 in the browser.

Server (backend)
1. Change to the server folder and install dependencies:
   ```powershell
   cd server
   npm install
   ```
2. Generate Prisma client and migrate DB:
   ```powershell
   npx prisma generate --schema=prisma/schema.prisma
   npx prisma migrate dev --schema=prisma/schema.prisma --name init
   ```
3. Seed sample data (optional):
   ```powershell
   npm run seed
   ```
4. Start the server
   ```powershell
   npm start
   ```
The server listens on http://localhost:4000 by default.

Generating icons
Put your icon files in `public/` as:
- `/public/favicon.ico` (32x32)
- `/public/apple-touch-icon.png` (180x180)
- `/public/icons/icon-192.png` (192x192)
- `/public/icons/icon-512.png` (512x512)

You can use ImageMagick or the included Node script to generate them. Example using ImageMagick:
```powershell
magick convert source.png -resize 192x192 public/icons/icon-192.png
magick convert source.png -resize 512x512 public/icons/icon-512.png
magick convert source.png -resize 180x180 public/apple-touch-icon.png
magick convert source.png -resize 32x32  public/favicon.ico
```
Or run the script (requires Node dev deps installed):
```powershell
npm run generate-icons
```

Git workflow / commit guidelines
- Stage changes: `git add .`
- Commit: `git commit -m "feat/module: short description"`
- Push branch: `git push -u origin <branch>`
- Use branch naming: `feature/<what>`, `fix/<what>`, `chore/<what>`

Basic deployment
- Frontend can be deployed to Vercel / Netlify (Vite build or static hosting)
- Backend is a simple Node/Express API; for production use Postgres and setup proper environment variables and process manager (PM2) or Docker.
- To build the frontend: `npm run build` and use the `dist/` output.

CI (GitHub Actions)
- A minimal workflow is included under `.github/workflows/ci.yml`. It runs install + build + Prisma generate.

Extras
- Regenerate Prisma client after schema change: `npx prisma generate`
- To seed data: `cd server && npm run seed`
