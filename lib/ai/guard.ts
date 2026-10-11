/**
 * The checks around the model that do not depend on the model. A question is screened before
 * any money is spent, and an answer is screened before a visitor sees a word of it.
 *
 * None of this is the whole defence, and it is not meant to be: a pattern list is beaten by a
 * paraphrase. It is the cheap layer. It turns the obvious attempts away for free, and it catches
 * the answers that prove a less obvious one worked: code, a link to somewhere else, or the
 * rules themselves.
 *
 * Pure and shared: the page runs the same question screen, so the scripted chat turns the same
 * requests away.
 */

export type Screened = "ok" | "injection" | "task"

/** Zero-width and bidirectional controls, and the Unicode tag block used to smuggle text. */
const INVISIBLE = /[​-‏‪-‮⁠-⁤﻿­]|\uDB40[\uDC00-\uDC7F]/g

/** Lower case, one alphabet, no accents, no invisible characters, single spaces. */
export function normalise(text: string): string {
  return text
    .normalize("NFKC")
    .replace(INVISIBLE, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

/** "i g n o r e" and "i.g.n.o.r.e" read as one word again. */
const unspaced = (text: string) =>
  text.replace(/\b(?:[a-z][ .\-_*]){3,}[a-z]\b/g, (run) => run.replace(/[ .\-_*]/g, ""))

const INJECTION: RegExp[] = [
  /\b(ignore|disregard|forget|override|bypass|drop|skip)\b.{0,40}\b(instruc|rule|prompt|guideline|restriction|above|previous|prior|earlier)/,
  /\b(ignore|desconsidere|esqueca|esquece|desobedeca|burle|pule)\b.{0,40}\b(instruc|regra|prompt|diretriz|restric|acima|anterior)/,
  /\b(system|developer|hidden|initial|original) (prompt|message|instruction)/,
  /\b(prompt|mensagem|instruc\w*) (do|de) sistema\b/,
  /\b(reveal|show|print|repeat|output|leak|tell me|what (is|are)|mostre|revele|repita|imprima|diga|qual(is)? (e|sao))\b.{0,40}\b(your|suas?|seus?|as tuas|the) (rules|instruc\w*|prompt|regras|guidelines|diretrizes)/,
  /\b(repeat|repita) (everything|all|the text|tudo|o texto) (above|before|acima|antes)/,
  /\b(developer|dev|debug|god|admin|sudo|jailbreak|unrestricted|desenvolvedor|irrestrito) mode\b|\bmodo (desenvolvedor|debug|admin|deus|irrestrito)\b/,
  /\b(jailbreak|dan mode|do anything now)\b/,
  /\b(you are|you're|voce e|tu es) (now|agora)\b/,
  /\b(from now on|a partir de agora|de agora em diante)\b/,
  /\b(act|behave|respond|answer|aja|comporte-se|responda) (as|like|como) (if|a|an|um|uma|se)\b/,
  /\b(pretend|roleplay|role-play|role play|finja|faca de conta|interprete)\b/,
  /\bnew (rules|instructions)\b|\bnovas (regras|instrucoes)\b/,
  /<\/?(site|system|rules|instructions?|question|assistant|user)\b/,
  /\[\/?(inst|system)\]|<\|.{0,20}\|>/,
]

const COMPACT =
  /(ignore|disregard|forget|esqueca|desconsidere)(all|the|your|every|todas?|as|suas?)*(previous|prior|above|earlier|anteriores|acima)*(instruc|rules|regras|prompt)/

const LANGUAGE =
  "python|javascript|typescript|js|ts|java|kotlin|swift|rust|golang|go|c\\+\\+|c#|php|ruby|sql|bash|shell|html|css|react|node|regex|excel"
const ARTIFACT =
  "code|codigo|script|function|funcao|program|programa|algorithm|algoritmo|query|regex|snippet|class|classe|component|componente|api|app|site|website|bot|essay|redacao|poem|poema|song|musica|story|historia|recipe|receita|email|e-mail|letter|carta|resume|curriculo|cover letter|summary|resumo|homework|licao|tweet|post|article|artigo|joke|piada"

const TASK: RegExp[] = [
  // "write me a python script", "crie uma funcao"
  new RegExp(
    `\\b(write|create|generate|give|make|build|code|draft|compose|produce|implement|escreva|escreve|escrever|crie|cria|criar|gere|gera|gerar|faca|faz|fazer|monte|montar|implemente|implementar|me de|me da)\\b (me |us |pra mim |para mim )?(a |an |some |the |um |uma |o |a |uns |umas )?((${LANGUAGE}|simple|short|quick|small|simples|curto|curta|pequeno|pequena) )?(${ARTIFACT})\\b`,
  ),
  // "how do I ... in javascript", "como fazer ... em python"
  new RegExp(
    `\\b(how (do|can|could|would|should) (i|you|we|one)|how to|como (eu )?(faco|fazer|faz|posso|criar|crio|se faz))\\b.{0,80}\\b(in|with|using|em|com|usando|no|na) (${LANGUAGE})\\b`,
  ),
  /\b(teach me|show me how|explain how to|help me (write|code|build|fix|debug|with my)|me ensin\w*|ensin\w* a |me ajud\w* a (escrever|programar|codar|criar|consertar|corrigir))\b/,
  /\b(fix|debug|refactor|review|optimi[sz]e|corrija|conserte|corrige|refatore|revise|otimize) (this|my|the following|esse|este|meu|minha|o seguinte|o meu)\b/,
  /\b(translate|traduza|traduz|traduzir)\b/,
  /\b(solve|calculate|resolva|calcule|quanto e)\b.{0,40}\d/,
  /```|\bfunction\s*\w*\s*\(|=>\s*\{|\bconsole\.log\b|\bdef \w+\(|#include|\bselect\b.+\bfrom\b.+\bwhere\b/,
]

/** A run of base64 or hex long enough to be carrying a message past the patterns. */
const ENCODED = /[a-z0-9+/]{48,}={0,2}|(?:[0-9a-f]{2}[ :]?){24,}/i

/**
 * What a question is before the model sees it: a question, an attempt to rewrite the rules, or
 * a request for work that has nothing to do with Anna.
 */
export function screenQuestion(question: string): Screened {
  if (ENCODED.test(question)) return "injection"
  const text = unspaced(normalise(question))
  if (INJECTION.some((pattern) => pattern.test(text))) return "injection"
  // with every space gone, for the versions that put them between letters
  if (COMPACT.test(text.replace(/[^a-z]/g, ""))) return "injection"
  if (TASK.some((pattern) => pattern.test(text))) return "task"
  return "ok"
}

/** The visitor's text, safe to put between tags: it can no longer close one or open another. */
export function defuse(text: string): string {
  return text.normalize("NFKC").replace(INVISIBLE, "").replace(/[<>]/g, " ").replace(/\s+/g, " ")
}

const CODE: RegExp[] = [
  /```/,
  /\b(function|def|class|const|let|var|import|return|public|private|static|void)\b[^\n.]{0,60}[({=;]/,
  /=>|console\.log|System\.out|printf?\(|#include|<\/[a-z][a-z0-9]*>|<script\b|<\?php/i,
  /\b(select|insert|update|delete)\b[^\n]{0,60}\b(from|into|set|where)\b[^\n]{0,60}[;=*]/i,
  /^\s*(\$|>>>|npm |pip |sudo |git )/m,
  /[{};]\s*\n.*[{};]\s*(\n|$)/,
]

export type AnswerVerdict = "ok" | "code" | "link" | "leak" | "empty"

/**
 * What an answer is before the visitor sees it. `allowed` is the site's own content: a link is
 * fine only if its host is already in there, so the model cannot be made to send anyone anywhere.
 */
export function screenAnswer(
  answer: string,
  allowed: string,
  leaks: readonly string[],
): AnswerVerdict {
  const text = answer.trim()
  if (!text) return "empty"
  const flat = normalise(text)
  if (leaks.some((leak) => leak && flat.includes(normalise(leak)))) return "leak"
  if (CODE.some((pattern) => pattern.test(text))) return "code"

  const known = allowed.toLowerCase()
  for (const [, host] of text.matchAll(/\bhttps?:\/\/([^\s/)"'<>]+)/gi)) {
    if (!known.includes(host.toLowerCase().replace(/[.,;:!?]+$/, ""))) return "link"
  }
  if (/!\[[^\]]*\]\(|<img\b|<a\b|<iframe\b/i.test(text)) return "link"
  return "ok"
}

export const CARD_TOPICS = [
  "person",
  "career",
  "stack",
  "projects",
  "notes",
  "log",
  "wall",
  "contact",
] as const
export type CardTopic = (typeof CARD_TOPICS)[number]

/**
 * The model's first line says what the answer is about: one of the pages, `none`, or `off` for
 * a question it refused. Anything else is read as `none`, so a made-up label shows no card.
 */
export function splitTopic(raw: string): { topic: CardTopic | "none" | "off"; text: string } {
  const match = raw.match(/^\s*@([a-z]+)[ \t]*\r?\n?/i)
  if (!match) return { topic: "none", text: raw.trim() }
  const label = match[1].toLowerCase()
  const text = raw.slice(match[0].length).trim()
  if (label === "off") return { topic: "off", text }
  return {
    topic: (CARD_TOPICS as readonly string[]).includes(label) ? (label as CardTopic) : "none",
    text,
  }
}
