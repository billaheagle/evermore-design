import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot reloads in dev, otherwise every
// change spins up a new connection pool and Postgres runs out of slots.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
