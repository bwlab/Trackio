import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connString = process.env.DATABASE_URL;
  if (!connString) {
    throw new Error("DATABASE_URL is not set");
  }

  // ponytail: self-hosted Postgres via plain pg adapter (upstream defaults to
  // Neon's proprietary WebSocket protocol, unusable against a normal Postgres container)
  const adapter = new PrismaPg({ connectionString: connString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
