# Server (local development)

This folder contains a minimal Express + Prisma (SQLite) backend used for local development.

How to run

1. From project root, install server dependencies:

   cd server
   npm install

2. Generate Prisma client and run migrations (this will create `prisma/dev.db`):

   npm run prisma:generate
   npm run prisma:migrate

3. Seed sample data (optional):

   npm run seed

4. Start the server:

   npm start

Server endpoints
- GET /health
- GET /service-orders
- POST /service-orders
- GET /inventory
- POST /inventory

If you prefer Postgres or another DB for production, we can adapt the `prisma/schema.prisma` datasource and migration steps.
