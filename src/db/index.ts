import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

// No lanzar error en build time — Railway construye antes de inyectar DATABASE_URL
// Si no hay URL, creamos un placeholder que solo fallará cuando realmente se intente consultar
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

let pool: Pool;

if (databaseUrl) {
  pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
      // Evitar que el build se cuelgue si la DB no responde
      connectionTimeoutMillis: 5000,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }
} else {
  // Placeholder para que el build de Next.js no falle en Railway sin env
  // Cualquier consulta real dará error controlado en lugar de crashear el build
  const dummyPool = {
    query: async () => {
      throw new Error("DATABASE_URL no configurada");
    },
    connect: async () => {
      throw new Error("DATABASE_URL no configurada");
    },
    end: async () => {},
    on: () => {},
  } as unknown as Pool;
  pool = dummyPool;
  if (process.env.NODE_ENV !== "production") {
    console.warn("⚠️ DATABASE_URL no definida — usando placeholder. Configúrala en Railway → Variables.");
  }
}

export { pool };

export const db = databaseUrl
  ? drizzle(pool)
  : // Proxy que lanza error solo cuando se intenta usar db en runtime, no en build
    (new Proxy(
      {},
      {
        get(_, prop) {
          if (prop === "execute" || prop === "select" || prop === "insert" || prop === "update" || prop === "delete") {
            return async () => {
              throw new Error(
                "DATABASE_URL no configurada. En Railway: añade PostgreSQL plugin y vincula DATABASE_URL en Variables."
              );
            };
          }
          // Para cualquier otra propiedad, devolver función que falla
          return () => {
            throw new Error("DATABASE_URL no configurada");
          };
        },
      }
    ) as unknown as ReturnType<typeof drizzle>);
