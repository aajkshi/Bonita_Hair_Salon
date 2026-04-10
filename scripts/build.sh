#!/bin/sh
export DATABASE_URL="${DATABASE_URL:-file:./dev.db}"
export AUTH_SECRET="${AUTH_SECRET:-bonita-salon-default-secret}"
npx prisma generate
npx prisma db push --accept-data-loss
npx next build
