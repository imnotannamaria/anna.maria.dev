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
  ["wall", /(wall|love letter|letter|testimonial|recommend|kind words|say about)/],
  ["log", /(\blog\b|watch|read\b|reading|listen|film|movie|series|book|album|game|podcast)/],
  ["notes", /(writ|wrote|blog|post|note|article|essay)/],
  ["projects", /(buil[dt]|project|made|ship|portfolio|open source|demo|librar)/],
  ["stack", /(stack|tech|tool|language|framework|\buse|app)/],
  ["career", /(work|job|career|experience|company|stud|school|degree|college|universit)/],
  ["contact", /(reach|contact|email|mail|hire|talk|linkedin|github|twitter)/],
  ["person", /(who|anna|about|person|she\b|her\b|cat|abimaela|live|from)/],
]

export function topicOf(question: string): Topic | null {
  const q = question.toLowerCase()
  return ROUTES.find(([, pattern]) => pattern.test(q))?.[0] ?? null
}
