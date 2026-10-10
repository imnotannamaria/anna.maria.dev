export type Month = readonly [year: number, month: number]

export type Entry = {
  id: string
  type: "work" | "study"
  org: string
  role: string
  from: Month

  until: Month | null
  current?: boolean
  text: string
  tags: string[]
  stats: { value: string; what: string }[]
}

export const CAREER: Entry[] = [
  {
    id: "cesar",
    type: "work",
    org: "cesar",
    role: "full-stack engineer",
    from: [2024, 7],
    until: null,
    current: true,
    text: "CESAR is one of Brazil's top innovation centers, and it's where I spent most of my time on ESG Carbon, a platform ranked top 5 in ESGTech in Brazil that serves 140+ companies. I architected and shipped it from zero with React, Next.js, TypeScript, Python and Django, turning a maze of GHG Protocol rules into a self-serve tool that cut manual reporting from 3 hours down to 5 minutes. These days I'm on a personal-finance fintech app, working end to end across a React Native app and a FastAPI backend on the Open Finance consent flow.",
    tags: ["react", "next.js", "django", "react native", "fastapi"],
    stats: [
      { value: "140+", what: "companies on ESG Carbon" },
      { value: "3h → 5min", what: "manual reporting" },
      { value: "top 5", what: "ESGTech in Brazil" },
    ],
  },
  {
    id: "avanade",
    type: "work",
    org: "avanade",
    role: "full-stack engineer",
    from: [2021, 3],
    until: [2024, 6],
    text: "Avanade is a Microsoft and Accenture joint venture, and over three years there I went from intern to mid level building chatbot and AI products for large enterprise clients. I co-led the delivery of a production WhatsApp chatbot that drove 97k+ re-engagements in three months, cut response time by 44%, and lifted NPS by 5 points. I also built secure RAG assistants with LangChain, Azure OpenAI and embeddings.",
    tags: ["langchain", "azure openai", "rag", ".net"],
    stats: [
      { value: "97k+", what: "re-engagements in three months" },
      { value: "−44%", what: "response time" },
      { value: "+5", what: "NPS points" },
    ],
  },
  {
    id: "fiap",
    type: "study",
    org: "fiap",
    role: "postgrad in ai engineering",
    from: [2026, 1],
    until: [2027, 3],
    current: true,
    text: "A postgrad certificate in AI Engineering that covers pretty much the whole modern AI stack, from machine learning fundamentals and computer vision to LLMs, generative AI, prompt engineering, fine-tuning, RAG and LangChain. I should wrap it up around march 2027.",
    tags: [],
    stats: [],
  },
  {
    id: "descomplica",
    type: "study",
    org: "descomplica",
    role: "bs in information systems",
    from: [2021, 1],
    until: [2025, 12],
    text: "My bachelor's in Information Systems, finished in december 2025. It covered a bit of everything, from data structures, databases and cloud computing to software design, AI algorithms and data science, which gave me the base to work across the whole product lifecycle.",
    tags: [],
    stats: [],
  },
]

export const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const

export function axis(entries: Entry[], today: readonly [year: number, month: number, day: number]) {
  const start = Math.min(...entries.map((entry) => entry.from[0]))
  const end = Math.max(today[0], ...entries.map((entry) => entry.until?.[0] ?? today[0]))
  const years = Array.from({ length: end - start + 1 }, (_, i) => start + i)
  const months = years.length * 12
  const index = ([year, month]: Month) => (year - start) * 12 + (month - 1)
  const now = index([today[0], today[1]]) + (today[2] - 1) / 31

  return {
    start,
    years,
    months,
    now,

    range(entry: Entry): { left: number; width: number } {
      const starts = index(entry.from)

      const ends = entry.until ? index(entry.until) + 1 : now
      return {
        left: (starts / months) * 100,
        width: ((ends - starts) / months) * 100,
      }
    },
  }
}

export function period(entry: Entry, open = "now"): string {
  return `${entry.from[0]} – ${entry.until ? entry.until[0] : open}`
}
