/**
 * wristkit shares the app-wide Postgres client. See lib/db/client.ts.
 * This file stays so existing imports keep resolving.
 */
export { createDb, dbUrl, type AppDb } from "@/lib/db/client"
