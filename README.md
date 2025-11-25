<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

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
