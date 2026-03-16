# Scripts Reference

## Development

- `pnpm dev`: start the Next.js dev server
- `pnpm build`: build the app
- `pnpm start`: run the production build
- `pnpm test`: run tests once
- `pnpm test:watch`: run tests in watch mode

## Database

- `pnpm db:setup`: interactive setup for local Postgres and Stripe-related env bootstrapping
- `pnpm db:format`: format Prisma schema files
- `pnpm db:generate`: generate Prisma client
- `pnpm db:migrate`: create and apply a development migration
- `pnpm db:migrate:create`: create a migration without applying it
- `pnpm db:push`: push schema state directly
- `pnpm db:seed`: seed local demo data and Stripe products
- `pnpm db:reset`: reset the database
- `pnpm db:studio`: open Prisma Studio

## Best Defaults For New Buyers

Most first-time setups only need:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```
