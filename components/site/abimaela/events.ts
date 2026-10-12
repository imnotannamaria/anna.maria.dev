/**
 * Everything Abimaela reacts to, in one table. No React and no images in here, so a test can
 * read it and hold `docs/abimaela.md` to it.
 *
 * Her lines for each event are in the messages (`cat.lines.<event>` in messages/en.json and
 * messages/pt.json): she goes through them in order and starts over.
 */
export type Gesture = "jump" | "angry" | "confused" | "happy"

/**
 * - `direct`: an answer to something done to her, or asked of her (a click on her, a command,
 *   a question). She always answers.
 * - `ambient`: something that happened on the page. She comments if she has not just spoken
 *   and nobody is typing.
 */
export type Urgency = "direct" | "ambient"

export const EVENTS = {
  // the visit
  day: { when: "the first seconds of a visit, from 6h to 18h", urgency: "direct" },
  night: { when: "the first seconds of a visit, the rest of the day", urgency: "direct" },

  // her
  click: { when: "a click on her", urgency: "direct", gesture: "jump" },
  clickAgain: { when: "a second click within 2.5 seconds", urgency: "direct", gesture: "angry" },
  meow: { when: "`meow`, `abimaela` or `pspsps` in the terminal", urgency: "direct" },

  // the three sides, and the frame
  front: { when: "switching to Front", urgency: "ambient" },
  back: { when: "switching to Back", urgency: "ambient" },
  ia: { when: "switching to IA", urgency: "ambient" },
  sidebar: { when: "the sidebar collapsed", urgency: "ambient" },
  light: { when: "the mode switched to light", urgency: "ambient", gesture: "jump" },
  dark: { when: "the mode switched to dark", urgency: "ambient" },
  mute: { when: "the site muted", urgency: "ambient" },
  unmute: { when: "the sound turned back on", urgency: "ambient", gesture: "jump" },

  // a page of the Front opening: one line of her own for each
  home: { when: "the home opening", urgency: "ambient" },
  person: { when: "Anna as a person opening", urgency: "ambient" },
  professional: { when: "Anna as a professional opening", urgency: "ambient" },
  notes: { when: "the notes opening", urgency: "ambient" },
  post: { when: "a note opening", urgency: "ambient" },
  projects: { when: "the projects opening", urgency: "ambient" },
  project: { when: "a case study opening", urgency: "ambient" },
  wall: { when: "the wall of love opening", urgency: "ambient" },
  contact: { when: "the contact page opening", urgency: "ambient" },
  log: { when: "the log opening", urgency: "ambient" },
  page: { when: "any other page opening", urgency: "ambient" },

  // what a visitor does on a page
  pin: { when: "a project pinned", urgency: "ambient" },
  copy: { when: "a contact or an app copied from a dock", urgency: "ambient" },
  sticker: { when: "a sticker dropped after a drag", urgency: "ambient" },
  react: { when: "a reaction left on a letter", urgency: "ambient", gesture: "happy" },
  sent: { when: "the postcard sent", urgency: "direct", gesture: "happy" },
  mailFailed: { when: "the postcard coming back", urgency: "direct", gesture: "confused" },
  bug: { when: "a bug report sent", urgency: "direct", gesture: "jump" },

  // the terminal
  secret: { when: "the hidden file read in the terminal", urgency: "direct" },
  snake: { when: "`snake` in the terminal", urgency: "direct" },
  sudo: { when: "`sudo` in the terminal", urgency: "direct", gesture: "angry" },
  unknown: { when: "a command the terminal does not know", urgency: "direct", gesture: "confused" },
  open: { when: "`open` sending the visitor to a page", urgency: "direct" },

  // the chat
  noAnswer: {
    when: "a question the scripted chat has no answer for",
    urgency: "direct",
    gesture: "confused",
  },
  offTopic: {
    when: "a question that is not about Anna, or an attempt on the chat's rules",
    urgency: "direct",
    gesture: "angry",
  },
  limit: { when: "the chat's daily limit reached", urgency: "direct" },
} as const satisfies Record<string, { when: string; urgency: Urgency; gesture?: Gesture }>

export type PetEvent = keyof typeof EVENTS
export const EVENT_NAMES = Object.keys(EVENTS) as PetEvent[]

/** The gesture that goes with an event's line, if it has one. */
export function gestureOf(event: PetEvent): Gesture | undefined {
  const meta = EVENTS[event] as { gesture?: Gesture }
  return meta.gesture
}

/** The event for a page opening: its own if it has one, the general one otherwise. */
export function pageEvent(screen: string | null): PetEvent {
  const id = screen?.split(":")[0]
  if (id === "wall-of-love") return "wall"
  return id && id in EVENTS && PAGE_EVENTS.has(id as PetEvent) ? (id as PetEvent) : "page"
}
const PAGE_EVENTS = new Set<PetEvent>([
  "home",
  "person",
  "professional",
  "notes",
  "post",
  "projects",
  "project",
  "contact",
  "log",
])

/** Whether the event is a page opening. */
export function isPageEvent(event: PetEvent): boolean {
  return event === "page" || event === "wall" || PAGE_EVENTS.has(event)
}

/** How long after a key in a field she still counts someone as typing. */
export const TYPING_MS = 1500
/** How long a line she could not say yet is still worth saying. */
export const WAITING_MS = 6000

/**
 * How long until she may say the line for this, zero being now. A direct event always gets its
 * line. An ambient one waits while someone is typing. Nothing waits for her last line: a new one
 * takes over from it at once, so a visitor clicking through pages is always answered about the
 * page they are on.
 */
export function waitToSpeak(
  event: PetEvent,
  now: number,
  last: { spokeAt: number; typedAt: number },
): number {
  if (EVENTS[event].urgency === "direct") return 0
  return Math.max(0, last.typedAt + TYPING_MS - now)
}

/** Whether she says something now. */
export function shouldSpeak(
  event: PetEvent,
  now: number,
  last: { spokeAt: number; typedAt: number },
): boolean {
  return waitToSpeak(event, now, last) === 0
}
