import {
  siTypescript,
  siJavascript,
  siPython,
  siReact,
  siNextdotjs,
  siTailwindcss,
  siRadixui,
  siRedux,
  siJest,
  siPytest,
  siCypress,
  siSonarqubeserver,
  siNodedotjs,
  siDjango,
  siDotnet,
  siGraphql,
  siHono,
  siNestjs,
  siFastapi,
  siPostgresql,
  siSupabase,
  siMongodb,
  siMysql,
  siFirebase,
  siDrizzle,
  siPrisma,
  siRedis,
  siPlotly,
  siLangchain,
  siPandas,
  siClaude,
  siDocker,
  siVercel,
  siResend,
  siFigma,
  siGithubactions,
} from "simple-icons"

/**
 * The stack, and the glyph for each entry.
 *
 * It lived as two consts inside `app/about/page.tsx` until the graph needed the same data
 * in a client component. Only strings cross that boundary — `TECH_ICONS` holds SVG path
 * data, not icon components — so this module stays free of JSX and both sides import it.
 */

export const TECH_ICONS: Record<string, string> = {
  typescript: siTypescript.path,
  javascript: siJavascript.path,
  python: siPython.path,
  react: siReact.path,
  "react native": siReact.path,
  "next.js": siNextdotjs.path,
  tailwind: siTailwindcss.path,
  "radix ui": siRadixui.path,
  redux: siRedux.path,
  jest: siJest.path,
  pytest: siPytest.path,
  cypress: siCypress.path,
  sonarqube: siSonarqubeserver.path,
  "node.js": siNodedotjs.path,
  django: siDjango.path,
  "django rest": siDjango.path,
  ".net": siDotnet.path,
  graphql: siGraphql.path,
  hono: siHono.path,
  nestjs: siNestjs.path,
  fastapi: siFastapi.path,
  postgres: siPostgresql.path,
  postgresql: siPostgresql.path,
  supabase: siSupabase.path,
  mongodb: siMongodb.path,
  mysql: siMysql.path,
  firebase: siFirebase.path,
  drizzle: siDrizzle.path,
  prisma: siPrisma.path,
  redis: siRedis.path,
  plotly: siPlotly.path,
  langchain: siLangchain.path,
  pandas: siPandas.path,
  "claude code": siClaude.path,
  docker: siDocker.path,
  "docker compose": siDocker.path,
  vercel: siVercel.path,
  resend: siResend.path,
  "react email": siResend.path,
  figma: siFigma.path,
  // The one concept in this map with a product behind it: the CI here is GitHub Actions.
  // The rest of the unmapped entries stay on the ◆ fallback on purpose — see the audit:
  // eight of them have no icon in simple-icons at all, three aren't brands.
  "ci/cd": siGithubactions.path,
}

export type StackGroup = { key: string; items: string[] }

export const STACK_GROUPS: StackGroup[] = [
  { key: "languages", items: ["typescript", "javascript", "python", "sql", "c#"] },
  {
    key: "frontend",
    items: [
      "react",
      "react native",
      "next.js",
      "tailwind",
      "zustand",
      "redux",
      "radix ui",
      "playwright",
      "jest",
      "cypress",
    ],
  },
  {
    key: "backend",
    items: ["node.js", "django", "django rest", ".net", "graphql", "hono", "nestjs", "fastapi"],
  },
  {
    key: "databases",
    items: [
      "postgresql",
      "supabase",
      "sql server",
      "mongodb",
      "redis",
      "mysql",
      "firebase",
      "drizzle",
      "prisma",
    ],
  },
  {
    key: "ai / llm",
    items: [
      "langchain",
      "pandas",
      "plotly",
      "azure openai",
      "rag",
      "prompt eng.",
      "embeddings",
      "claude code",
    ],
  },
  { key: "devops · cloud", items: ["docker", "docker compose", "azure", "vercel", "ci/cd"] },
  { key: "testing · quality", items: ["pytest", "sonarqube"] },
  { key: "email · design", items: ["resend", "react email", "figma"] },
]

export const STACK_TOTAL = STACK_GROUPS.reduce((sum, group) => sum + group.items.length, 0)
