import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? "postgresql://neondb_owner:npg_taxqwu1lO3ih@ep-aged-tree-b2nkqfsf-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Lazily created singleton so builds without a real DB configured don't crash.
const globalForDb = globalThis as unknown as {
  _bfClient?: postgres.Sql;
  _bfKeepAlive?: ReturnType<typeof setInterval>;
};

const client = globalForDb._bfClient ?? postgres(connectionString, { max: 5, onnotice: () => {} });
if (process.env.NODE_ENV !== "production") globalForDb._bfClient = client;

export const db = drizzle(client, { schema });
export { schema };

// Managed Postgres providers (e.g. Neon) suspend/sleep the underlying compute
// after ~5 minutes of inactivity, adding cold-start latency to the next
// request. Ping the DB on the same cadence to keep it warm.
const KEEP_ALIVE_INTERVAL_MS = 5 * 60 * 1000;

function startKeepAlivePing() {
  if (globalForDb._bfKeepAlive) return;

  const interval = setInterval(() => {
    client`select 1`.catch((error) => {
      console.error("[db] keep-alive ping failed", error);
    });
  }, KEEP_ALIVE_INTERVAL_MS);

  // Don't let the interval keep the Node process alive on its own (e.g. during tests/scripts).
  interval.unref?.();
  globalForDb._bfKeepAlive = interval;
}

startKeepAlivePing();