import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? "postgres://localhost:5432/brainfreeze";

// Lazily created singleton so builds without a real DB configured don't crash.
const globalForDb = globalThis as unknown as { _bfClient?: postgres.Sql };

const client = globalForDb._bfClient ?? postgres(connectionString, { max: 5, onnotice: () => {} });
if (process.env.NODE_ENV !== "production") globalForDb._bfClient = client;

export const db = drizzle(client, { schema });
export { schema };