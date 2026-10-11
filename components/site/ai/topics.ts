import { normalise, screenQuestion } from "@/lib/ai/guard"

export type Topic =
  | "wall"
  | "log"
  | "notes"
  | "projects"
  | "stack"
  | "career"
  | "contact"
  | "person"

/**
 * Which page a question is about, by keyword. The order is the contract: the most specific
 * subject comes first, so "what films does she love?" is the log and not the wall of love, and
 * "who" only catches what nothing else did.
 */
const ROUTES: [Topic, RegExp][] = [
  [
    "wall",
    /(wall|love letter|letter|testimonial|recommend|kind words|say about|carta|depoimento|recomenda|mural|dizem sobre|falam sobre)/,
  ],
  [
    "log",
    /(\blog\b|watch|read\b|reading|listen|film|movie|series|book|album|game|podcast|assist|\ble\b|lendo|ouv|filme|serie|livro|jogo)/,
  ],
  ["notes", /(writ|wrote|blog|post|note|article|essay|escrev|nota|artigo|texto)/],
  [
    "projects",
    /(buil[dt]|project|made|ship|portfolio|open source|demo|librar|constru|projeto|criou|fez\b|biblioteca)/,
  ],
  [
    "stack",
    /(stack|tech|tool|language|framework|\buse|app|tecnologia|ferramenta|linguagem|\busa\b)/,
  ],
  [
    "career",
    /(work|job|career|experience|company|stud|school|degree|college|universit|trabalh|emprego|carreira|experiencia|empresa|estud|faculdade|formacao)/,
  ],
  [
    "contact",
    /(reach|contact|email|mail|hire|talk|linkedin|github|twitter|contato|contrat|falar com|falo com|conversar)/,
  ],
  [
    "person",
    /(who|anna|about|person|she\b|her\b|cat|abimaela|live|from|quem|sobre|pessoa|ela\b|dela\b|gata|mora|de onde)/,
  ],
]

export function topicOf(question: string): Topic | null {
  // a request for work is about no page, whatever words it borrows: "a log in javascript"
  if (screenQuestion(question) !== "ok") return null
  // without accents, so "série" and "serie" are the same word
  const q = normalise(question)
  return ROUTES.find(([, pattern]) => pattern.test(q))?.[0] ?? null
}
