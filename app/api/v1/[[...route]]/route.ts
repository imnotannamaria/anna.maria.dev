import { handle } from "hono/vercel"
import { app } from "@/lib/api/app"

// node:crypto's timingSafeEqual and the postgres driver both need Node, not Edge.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
