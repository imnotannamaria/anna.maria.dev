import type { SubmissionField } from "./validation"
import type { WallLang } from "./constants"

/**
 * Everything the invite form says, in both of its languages. Choosing the flag changes the
 * whole form, not only the field: someone who picked Portuguese should not read
 * "your message".
 *
 * No zod import here, so the wall's card can read "read more" without the validation library.
 */
export const COPY = {
  "pt-BR": {
    noteLabel: "da anna",
    noteFor: "pra",
    langLegend: "em que idioma você quer escrever?",
    name: "nome",
    company: "empresa",
    role: "cargo",
    linkedin: "linkedin",
    linkedinPlaceholder: "https://linkedin.com/in/…",
    optional: "opcional",
    message: "depoimento",
    messagePlaceholder: "como foi trabalhar comigo?",
    messageHint: "duas ou três frases já está ótimo.",
    photo: "foto",
    photoAdd: "escolher foto",
    photoChange: "trocar",
    photoRemove: "remover",
    photoHint: "opcional. sem foto, vão as suas iniciais.",
    review: "nada é publicado direto: a anna lê e aprova antes.",
    sendShort: "enviar →",
    next: "continuar →",
    back: "voltar",
    preview: "como vai aparecer",
    stepLang: "idioma",
    stepMessage: "depoimento",
    stepYou: "quem assina",
    titles: ["Antes de tudo", "O depoimento", "Quem assina"],
    questions: [
      "Primeiro: em qual língua você quer escrever?",
      "Agora o depoimento. Como foi trabalhar junto?",
      "Por último: quem assina?",
    ],
    stepOf: "de",
    seeWall: "ver a parede",
    lookAround: "conhecer o site",
    failed: "Não foi. O erro é do meu lado, e o seu texto continua aqui.",
    sentTitle: "Recebido.",
    sentBody: "Obrigada, de verdade. Vou ler com calma e, aprovando, ele entra na parede assim:",
    expiredOutput: "invite: link expirado",
    expiredTitle: "Este link venceu.",
    expiredBody: "Os convites valem por 24 horas. Me chama que eu mando um novo.",
    expiredAction: "pedir outro link",
    usedOutput: "invite: já enviado",
    usedTitle: "Você já escreveu.",
    usedBody: "Seu depoimento chegou e está comigo. Se quiser mudar algo, me chama.",
    readMore: "ler mais",
    readLess: "ler menos",
    errorNetwork: "Sem conexão. Nada foi enviado; tenta de novo.",
    errorServer: "Algo deu errado do meu lado. Nada foi enviado; tenta de novo em instantes.",
    errorPhoto: "Não consegui ler essa foto. Tenta outra, ou envia sem.",
    fieldErrors: {
      name: "seu nome, por favor",
      company: "onde a gente trabalhou junto?",
      role: "cargo muito longo",
      linkedin: "cola o link do seu perfil, começando com https://",
      lang: "escolhe um idioma",
      message: "escreve pelo menos uma frase (até 3.000 caracteres)",
    } satisfies Record<SubmissionField, string>,
  },
  en: {
    noteLabel: "from anna",
    noteFor: "for",
    langLegend: "which language do you want to write in?",
    name: "name",
    company: "company",
    role: "role",
    linkedin: "linkedin",
    linkedinPlaceholder: "https://linkedin.com/in/…",
    optional: "optional",
    message: "testimonial",
    messagePlaceholder: "what was it like working with me?",
    messageHint: "two or three sentences is plenty.",
    photo: "photo",
    photoAdd: "choose a photo",
    photoChange: "change",
    photoRemove: "remove",
    photoHint: "optional. without one, your initials go up.",
    review: "nothing goes live on its own: anna reads and approves it first.",
    sendShort: "send →",
    next: "continue →",
    back: "back",
    preview: "how it will look",
    stepLang: "language",
    stepMessage: "testimonial",
    stepYou: "who signs it",
    titles: ["First things first", "The testimonial", "Who signs it"],
    questions: [
      "First: which language do you want to write in?",
      "Now the letter. How was it, working together?",
      "Last one: who signs it?",
    ],
    stepOf: "of",
    seeWall: "see the wall",
    lookAround: "look around the site",
    failed: "It did not go through. My side failed, and your letter is still here.",
    sentTitle: "Got it.",
    sentBody: "Thank you, really. I'll read it properly, and once approved it goes up like this:",
    expiredOutput: "invite: link expired",
    expiredTitle: "This link has expired.",
    expiredBody: "Invites last 24 hours. Ping me and I'll send a new one.",
    expiredAction: "ask for a new link",
    usedOutput: "invite: already sent",
    usedTitle: "You already wrote one.",
    usedBody: "Your testimonial arrived and it's with me. If you want to change it, ping me.",
    readMore: "read more",
    readLess: "read less",
    errorNetwork: "No connection. Nothing was sent; try again.",
    errorServer: "Something went wrong on my side. Nothing was sent; try again in a moment.",
    errorPhoto: "I couldn't read that photo. Try another one, or send without it.",
    fieldErrors: {
      name: "your name, please",
      company: "where did we work together?",
      role: "that role is too long",
      linkedin: "paste your profile link, starting with https://",
      lang: "pick a language",
      message: "write at least a sentence (up to 3,000 characters)",
    } satisfies Record<SubmissionField, string>,
  },
} as const

export type Copy = (typeof COPY)[WallLang]

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

/** `2026-09` → `sep 2026`. No `Date`: a `YYYY-MM` has no time zone to get wrong. */
export function formatMonth(value: string): string {
  const [year, month] = value.split("-")
  return `${MONTHS[Number(month) - 1]} ${year}`
}
