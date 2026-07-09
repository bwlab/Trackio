// Crea/aggiorna un utente con login email+password.
// Uso: node scripts/create-user.mjs <email> <password> ["Nome"]
import { randomBytes, scryptSync, randomUUID } from "node:crypto";
import pg from "pg";

function hashPassword(plain) {
  const salt = randomBytes(16);
  const derived = scryptSync(plain, salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

const [email, password, name] = process.argv.slice(2);
if (!email || !password) {
  console.error("Uso: node scripts/create-user.mjs <email> <password> [\"Nome\"]");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const passwordHash = hashPassword(password);

await client.query(
  `INSERT INTO "User" (id, email, name, password)
   VALUES ($1, $2, $3, $4)
   ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, name = COALESCE(EXCLUDED.name, "User".name)`,
  [randomUUID(), email, name ?? null, passwordHash]
);

console.log(`Utente ${email} creato/aggiornato.`);
await client.end();
